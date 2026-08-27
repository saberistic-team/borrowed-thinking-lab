import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { BrainAvatar } from "@/components/brain-visuals";
import { StepFrame } from "@/components/step-frame";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { getBrain } from "@/lib/brains";
import {
  generateCrossExaminationFn,
  generateFinalPositionsFn,
  generatePositionsFn,
} from "@/lib/decisions.functions";
import { STANCE_LABEL, type BrainPosition, type UpdatedPosition } from "@/lib/decision-types";
import { useSession } from "@/lib/session-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/d/$sessionId/debate")({
  head: () => ({
    meta: [
      { title: "The Roundtable — Borrowed Brain" },
      { name: "description", content: "Independent positions, cross-examination, and changed minds." },
      { property: "og:title", content: "The Roundtable" },
      { property: "og:description", content: "Watch five ways of thinking argue about your decision." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DebatePage,
});

type Stage = "idle" | "positions" | "cross" | "final" | "done";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "",
  positions: "Round 1 — each brain takes a position, alone",
  cross: "Round 2 — cross-examination",
  final: "Round 3 — final positions and changed minds",
  done: "The table has finished",
};

function PositionCard({ position, final }: { position: BrainPosition | UpdatedPosition; final?: boolean }) {
  const brain = getBrain(position.brainId);
  const changed = final && (position as UpdatedPosition).changedMind;
  return (
    <div className="seat-in rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        {brain ? <BrainAvatar brain={brain} active={changed} /> : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base">{brain?.name}</p>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {STANCE_LABEL[position.stance]}
            </span>
            <span className="text-xs text-muted-foreground">{position.confidence}% confident</span>
            {changed ? (
              <span className="rounded-full bg-ember/12 px-2 py-0.5 text-xs text-ember">Changed mind</span>
            ) : null}
          </div>
          <p className="mt-2 leading-relaxed">{position.recommendation}</p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {position.reasoning.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-ember">—</span>
                {r}
              </li>
            ))}
          </ul>
          {changed ? (
            <p className="mt-3 rounded-lg bg-secondary/70 p-3 text-sm">
              {(position as UpdatedPosition).changeSummary}
            </p>
          ) : null}
          <p className="mt-3 text-sm">
            <span className="text-muted-foreground">Biggest concern: </span>
            {position.biggestConcern}
          </p>
        </div>
      </div>
    </div>
  );
}

function DebatePage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const { session, ready, update } = useSession(sessionId);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const run = useCallback(async () => {
    const current = session;
    if (!current) return;
    setError(null);
    const payloadBase = {
      problem: current.problem,
      context: current.context,
      brainIds: current.selectedBrainIds,
      interrogation: current.interrogation,
    };
    try {
      track("debate_started", { brains: current.selectedBrainIds.length });
      setStage("positions");
      const positions = await generatePositionsFn({ data: payloadBase });
      update({ initialPositions: positions });

      setStage("cross");
      const debate = await generateCrossExaminationFn({ data: { ...payloadBase, positions } });
      update({ debateMessages: debate });

      setStage("final");
      const finals = await generateFinalPositionsFn({ data: { ...payloadBase, positions, debate } });
      update({ finalPositions: finals });
      finals
        .filter((f) => f.changedMind)
        .forEach((f) => track("brain_changed_mind", { brainId: f.brainId }));

      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The roundtable broke down.");
      setStage("idle");
    }
  }, [session, update]);

  useEffect(() => {
    if (!ready || !session || started.current) return;
    started.current = true;
    if (session.finalPositions.length > 0) {
      setStage("done");
      return;
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session?.id]);

  if (!ready) return <StepFrame step={3} title="Loading" wide />;
  if (!session)
    return (
      <StepFrame step={3} title="This decision has expired" wide>
        <Button onClick={() => navigate({ to: "/" })}>Back to start</Button>
      </StepFrame>
    );

  const busy = stage !== "idle" && stage !== "done";
  const finals = session.finalPositions;

  return (
    <StepFrame step={3} title="The Roundtable" subtitle={STAGE_LABEL[stage] || undefined} wide>
      {busy ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <Loader2 className="size-4 animate-spin text-ember" />
          {STAGE_LABEL[stage]}
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => void run()}>
            <RefreshCcw className="size-4" /> Try again
          </Button>
        </div>
      ) : null}

      {session.initialPositions.length > 0 ? (
        <section>
          <h2 className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Round 1 — opening positions
          </h2>
          <div className="mt-4 grid gap-4">
            {session.initialPositions.map((p) => (
              <PositionCard key={p.brainId} position={p} />
            ))}
          </div>
        </section>
      ) : null}

      {session.debateMessages.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Round 2 — cross-examination
          </h2>
          <div className="mt-4 space-y-4">
            {session.debateMessages.map((m, i) => {
              const from = getBrain(m.fromBrainId);
              const to = getBrain(m.toBrainId);
              return (
                <div key={i} className="seat-in rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {from ? <BrainAvatar brain={from} size="sm" /> : null}
                    <span className="font-medium">{from?.name}</span>
                    <span className="text-muted-foreground">challenges</span>
                    {to ? <BrainAvatar brain={to} size="sm" /> : null}
                    <span className="font-medium">{to?.name}</span>
                    <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {m.disagreementType.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-3 border-l-2 border-ember/60 pl-3 leading-relaxed">{m.challenge}</p>
                  <p className={cn("mt-3 border-l-2 border-border pl-3 leading-relaxed text-muted-foreground")}>
                    {m.response}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {finals.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Round 3 — final positions
          </h2>
          {finals.some((f) => f.changedMind) ? (
            <p className="mt-2 text-sm text-ember">
              {finals.filter((f) => f.changedMind).length} brain
              {finals.filter((f) => f.changedMind).length === 1 ? "" : "s"} changed their mind.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Nobody moved. The disagreement is real.</p>
          )}
          <div className="mt-4 grid gap-4">
            {finals.map((p) => (
              <PositionCard key={p.brainId} position={p} final />
            ))}
          </div>
        </section>
      ) : null}

      <div className="sticky bottom-0 mt-10 -mx-5 flex items-center justify-between gap-4 border-t border-border bg-background/90 px-5 py-4 backdrop-blur">
        <p className="text-sm text-muted-foreground">
          {stage === "done" ? "Now see what it all adds up to." : "You can skip ahead once they finish."}
        </p>
        <Button
          size="lg"
          disabled={finals.length === 0}
          onClick={() => navigate({ to: "/d/$sessionId/board", params: { sessionId } })}
        >
          Decision Board
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </StepFrame>
  );
}
