import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { BrainAvatar } from "@/components/brain-visuals";
import { CouncilBar } from "@/components/council-bar";
import { SpeakingIndicator } from "@/components/speaking-indicator";
import { StepFrame } from "@/components/step-frame";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";
import { getBrain, getBrains } from "@/lib/brains";
import { generateQuestionForBrainFn } from "@/lib/decisions.functions";
import type { InterrogationItem } from "@/lib/decision-types";
import { getSession, useSession } from "@/lib/session-store";

export const Route = createFileRoute("/d/$sessionId/questions")({
  head: () => ({
    meta: [
      { title: "Interrogation — Borrowed Brain" },
      { name: "description", content: "Each brain asks the one question its worldview needs answered." },
      { property: "og:title", content: "Interrogation" },
      { property: "og:description", content: "Each brain asks one question before it takes a position." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QuestionsPage,
});

function QuestionsPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const { session, ready, update } = useSession(sessionId);
  const [thinking, setThinking] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<string[]>([]);
  const loading = useRef(false);

  const brains = useMemo(() => getBrains(session?.selectedBrainIds ?? []), [session?.selectedBrainIds]);

  const load = useCallback(
    async (onlyIds?: string[]) => {
      const current = getSession(sessionId);
      if (!current || current.selectedBrainIds.length === 0 || loading.current) return;
      const targets = (onlyIds ?? current.selectedBrainIds).filter(
        (id) => !current.interrogation.some((q) => q.brainId === id),
      );
      if (targets.length === 0) return;

      loading.current = true;
      setFailed([]);
      setThinking(new Set(targets));
      const order = current.selectedBrainIds;

      await Promise.all(
        targets.map(async (brainId) => {
          try {
            const item = await generateQuestionForBrainFn({
              data: {
                problem: current.problem,
                context: current.context,
                brainIds: current.selectedBrainIds,
                brainId,
              },
            });
            update((prev) => ({
              interrogation: [
                ...prev.interrogation.filter((q) => q.brainId !== brainId),
                item as InterrogationItem,
              ].sort((a, b) => order.indexOf(a.brainId) - order.indexOf(b.brainId)),
            }));
          } catch (err) {
            setFailed((prev) => [...prev, brainId]);
            toast.error(
              err instanceof Error ? err.message : `${getBrain(brainId)?.name ?? "A brain"} stayed silent.`,
            );
          } finally {
            setThinking((prev) => {
              const next = new Set(prev);
              next.delete(brainId);
              return next;
            });
          }
        }),
      );
      loading.current = false;
    },
    [sessionId, update],
  );

  useEffect(() => {
    if (!ready || !session) return;
    if (session.selectedBrainIds.length === 0) return;
    if (session.interrogation.length >= session.selectedBrainIds.length) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session?.id, session?.selectedBrainIds.length]);

  if (!ready) return <StepFrame step={2} title="Loading" />;
  if (!session)
    return (
      <StepFrame step={2} title="This decision has expired">
        <Button onClick={() => navigate({ to: "/" })}>Back to start</Button>
      </StepFrame>
    );

  const answered = session.interrogation.filter((i) => (i.answer ?? "").trim().length > 0).length;
  const thinkingBrains = brains.filter((b) => thinking.has(b.id));

  return (
    <StepFrame
      step={2}
      title="They have questions first."
      subtitle="Answer what you can. “I don't know” is a real answer — they will factor it in."
    >
      <CouncilBar brains={brains} thinkingIds={thinking} />

      {failed.length > 0 ? (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <span>
            {failed.length} brain{failed.length === 1 ? "" : "s"} didn't come back with a question.
          </span>
          <Button size="sm" variant="outline" onClick={() => void load(failed)}>
            <RefreshCcw className="size-4" /> Try again
          </Button>
        </div>
      ) : null}

      <div className="space-y-4">
        {session.interrogation.map((item, index) => {
          const brain = getBrain(item.brainId);
          return (
            <div
              key={item.brainId}
              className="seat-in rounded-2xl border border-border bg-card p-5"
              style={{ animationDelay: `${Math.min(index, 4) * 70}ms` }}
            >
              <div className="flex items-start gap-3">
                {brain ? <BrainAvatar brain={brain} /> : null}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm text-muted-foreground">{brain?.name}</p>
                  <p className="mt-1 text-lg leading-snug">{item.question}</p>
                  <Textarea
                    value={item.answer ?? ""}
                    placeholder="Your answer…"
                    className="mt-3 min-h-20 bg-background"
                    onChange={(e) => {
                      const value = e.target.value;
                      update((prev) => ({
                        interrogation: prev.interrogation.map((q) =>
                          q.brainId === item.brainId ? { ...q, answer: value } : q,
                        ),
                      }));
                    }}
                    onBlur={() => track("interrogation_answered", { brainId: item.brainId })}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {thinkingBrains.map((b) => (
          <SpeakingIndicator key={b.id} brain={b} verb="is reading your problem" />
        ))}
      </div>

      <div className="sticky bottom-0 mt-8 -mx-5 flex items-center justify-between gap-4 border-t border-border bg-background/90 px-5 py-4 backdrop-blur">
        <p className="text-sm text-muted-foreground">
          {answered}/{session.interrogation.length} answered
        </p>
        <Button
          size="lg"
          disabled={session.interrogation.length === 0}
          onClick={() => navigate({ to: "/d/$sessionId/debate", params: { sessionId } })}
        >
          Start the Roundtable
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </StepFrame>
  );
}
