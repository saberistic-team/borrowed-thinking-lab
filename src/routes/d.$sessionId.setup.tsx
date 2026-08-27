import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Shuffle, Sparkles, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BrainAvatar } from "@/components/brain-visuals";
import { BrainCard } from "@/components/brain-card";
import { StepFrame } from "@/components/step-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";
import { BRAINS, MAX_BRAINS, detectBalance, getBrain, getBrains, surpriseMe } from "@/lib/brains";
import { recommendSetupFn } from "@/lib/decisions.functions";
import { useSession } from "@/lib/session-store";
import type { DecisionContext } from "@/lib/decision-types";

export const Route = createFileRoute("/d/$sessionId/setup")({
  head: () => ({
    meta: [
      { title: "Set up your roundtable — Borrowed Brain" },
      { name: "description", content: "Frame the decision, add context, and choose who should think about it." },
      { property: "og:title", content: "Set up your roundtable" },
      { property: "og:description", content: "Frame the decision and choose your brains." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SetupPage,
});

const CONTEXT_FIELDS: { key: keyof DecisionContext; label: string; placeholder: string; long?: boolean }[] = [
  { key: "background", label: "Background", placeholder: "What led to this?", long: true },
  { key: "constraints", label: "Constraints", placeholder: "Money, time, people, obligations" },
  { key: "desiredOutcome", label: "What good looks like", placeholder: "How you'd know this went well" },
  { key: "deadline", label: "Deadline", placeholder: "When does this need deciding?" },
  { key: "moneyInvolved", label: "Money involved", placeholder: "Rough numbers help" },
  { key: "peopleInvolved", label: "People involved", placeholder: "Who else is affected?" },
  { key: "alternatives", label: "Already considered", placeholder: "Options you've weighed and set aside" },
];

function SetupPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const { session, ready, update } = useSession(sessionId);
  const [recommending, setRecommending] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);

  if (!ready) return <StepFrame step={1} title="Loading" />;
  if (!session)
    return (
      <StepFrame step={1} title="This decision has expired">
        <p className="text-muted-foreground">Start a new one from the home page.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/" })}>
          Back to start
        </Button>
      </StepFrame>
    );

  const selected = session.selectedBrainIds;
  const balance = detectBalance(selected);

  function toggle(id: string) {
    update((prev) => {
      const has = prev.selectedBrainIds.includes(id);
      if (!has && prev.selectedBrainIds.length >= MAX_BRAINS) return {};
      track(has ? "brain_removed" : "brain_selected", { brainId: id });
      return {
        selectedBrainIds: has
          ? prev.selectedBrainIds.filter((b) => b !== id)
          : [...prev.selectedBrainIds, id],
      };
    });
  }

  async function recommend() {
    if (!session) return;
    setRecommending(true);
    try {
      const result = await recommendSetupFn({ data: { problem: session.problem } });
      update({
        selectedBrainIds: result.brainIds,
        title: result.title,
        safetyNote: result.safetyNote,
      });
      setReason(result.reason);
      track("roundtable_recommended", { roundtableId: result.roundtableId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reach the table.");
    } finally {
      setRecommending(false);
    }
  }

  return (
    <StepFrame step={1} title="What are you deciding?">
      <Textarea
        value={session.problem}
        onChange={(e) => update({ problem: e.target.value, title: e.target.value.slice(0, 60) })}
        className="min-h-28 bg-card text-base"
      />

      {session.safetyNote ? (
        <div className="mt-4 flex gap-3 rounded-xl border border-ember/40 bg-ember/8 p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-ember" />
          <p>{session.safetyNote}</p>
        </div>
      ) : null}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Give the table some context</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowContext((v) => !v)}>
            {showContext ? "Hide" : "Add context"}
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          All optional. Anything you add sharpens the questions they ask you next.
        </p>

        {showContext ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {CONTEXT_FIELDS.map((f) => (
              <div key={f.key} className={f.long ? "sm:col-span-2" : undefined}>
                <Label className="text-xs tracking-wide text-muted-foreground uppercase">
                  {f.label}
                </Label>
                {f.long ? (
                  <Textarea
                    className="mt-1.5 bg-card"
                    placeholder={f.placeholder}
                    value={session.context[f.key] ?? ""}
                    onChange={(e) => update({ context: { ...session.context, [f.key]: e.target.value } })}
                  />
                ) : (
                  <Input
                    className="mt-1.5 bg-card"
                    placeholder={f.placeholder}
                    value={session.context[f.key] ?? ""}
                    onChange={(e) => update({ context: { ...session.context, [f.key]: e.target.value } })}
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">Who should think about this?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick up to five. {selected.length}/{MAX_BRAINS} seated.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={recommend} disabled={recommending}>
              {recommending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Recommend a Roundtable
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => update({ selectedBrainIds: surpriseMe(5) })}
            >
              <Shuffle className="size-4" />
              Surprise Me
            </Button>
          </div>
        </div>

        {reason ? <p className="mt-3 text-sm text-ember">{reason}</p> : null}

        {balance ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/60 p-4 text-sm">
            <span className="font-medium">{balance.message}</span>
            <span className="text-muted-foreground">{balance.suggestion}</span>
            <span className="ml-auto flex gap-2">
              {balance.addBrainIds
                .filter((id) => !selected.includes(id))
                .map((id) => {
                  const b = getBrain(id);
                  if (!b) return null;
                  return (
                    <Button key={id} size="sm" variant="ghost" onClick={() => toggle(id)}>
                      Add {b.name}
                    </Button>
                  );
                })}
            </span>
          </div>
        ) : null}

        {selected.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {getBrains(selected).map((b) => (
              <button
                key={b.id}
                onClick={() => toggle(b.id)}
                className="flex items-center gap-2 rounded-full border border-ember/50 bg-ember/8 py-1 pr-3 pl-1 text-sm"
              >
                <BrainAvatar brain={b} size="sm" active />
                {b.name}
                <span className="text-muted-foreground">×</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BRAINS.map((b) => (
            <BrainCard
              key={b.id}
              brain={b}
              selected={selected.includes(b.id)}
              disabled={selected.length >= MAX_BRAINS}
              onToggle={() => toggle(b.id)}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 mt-10 -mx-5 border-t border-border bg-background/90 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {selected.length < 2 ? "Seat at least two brains." : "Before they argue, they have questions."}
          </p>
          <Button
            size="lg"
            disabled={selected.length < 2}
            onClick={() => {
              track("decision_context_completed", { brains: selected.length });
              navigate({ to: "/d/$sessionId/questions", params: { sessionId } });
            }}
          >
            Put it on the table
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </StepFrame>
  );
}
