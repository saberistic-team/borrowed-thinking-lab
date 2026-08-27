import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BrainAvatar } from "@/components/brain-visuals";
import { StepFrame } from "@/components/step-frame";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";
import { getBrain } from "@/lib/brains";
import { generateQuestionsFn } from "@/lib/decisions.functions";
import { useSession } from "@/lib/session-store";

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
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    const current = getSession(sessionId);
    if (!current || current.selectedBrainIds.length === 0) return;
    setLoading(true);
    setFailed(false);
    generateQuestionsFn({
      data: {
        problem: current.problem,
        context: current.context,
        brainIds: current.selectedBrainIds,
      },
    })
      .then((questions) => {
        if (questions.length === 0) setFailed(true);
        else update({ interrogation: questions });
      })
      .catch((err: unknown) => {
        setFailed(true);
        toast.error(err instanceof Error ? err.message : "The table went quiet. Try again.");
      })
      .finally(() => setLoading(false));
  }, [sessionId, update]);

  useEffect(() => {
    if (!ready || !session || loading || failed) return;
    if (session.interrogation.length > 0 || session.selectedBrainIds.length === 0) return;
    load();
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

  return (
    <StepFrame
      step={2}
      title="They have questions first."
      subtitle="Answer what you can. “I don't know” is a real answer — they will factor it in."
    >
      {loading && session.interrogation.length === 0 ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> The table is reading your problem…
        </div>
      ) : null}

      <div className="space-y-4">
        {session.interrogation.map((item, index) => {
          const brain = getBrain(item.brainId);
          return (
            <div
              key={`${item.brainId}-${index}`}
              className="seat-in rounded-2xl border border-border bg-card p-5"
              style={{ animationDelay: `${index * 70}ms` }}
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
                        interrogation: prev.interrogation.map((q, i) =>
                          i === index ? { ...q, answer: value } : q,
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
