import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FlaskConical, Loader2, RefreshCcw, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { BrainAvatar } from "@/components/brain-visuals";
import { StepFrame } from "@/components/step-frame";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";
import { getBrain } from "@/lib/brains";
import { generateBoardFn, saveDecisionFn, testAssumptionFn } from "@/lib/decisions.functions";
import { useSession } from "@/lib/session-store";
import { useAuth } from "@/hooks/use-auth";
import type { DecisionAssumption } from "@/lib/decision-types";

export const Route = createFileRoute("/d/$sessionId/board")({
  head: () => ({
    meta: [
      { title: "Decision Board — Borrowed Brain" },
      { name: "description", content: "What the table agreed on, what it split on, and what it all turns on." },
      { property: "og:title", content: "Decision Board" },
      { property: "og:description", content: "The assumptions your decision actually rests on." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BoardPage,
});

type TestResult = {
  title: string;
  steps: string[];
  timeframe: string;
  successSignal: string;
  failureSignal: string;
};

function AssumptionRow({ a, problem }: { a: DecisionAssumption; problem: string }) {
  const [test, setTest] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl leading-relaxed">{a.statement}</p>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
          {a.currentConfidence}% confidence
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {a.supportedByBrainIds.map((id) => {
          const b = getBrain(id);
          return b ? <BrainAvatar key={`s-${id}`} brain={b} size="sm" active /> : null;
        })}
        {a.supportedByBrainIds.length && a.challengedByBrainIds.length ? (
          <span className="mx-1">vs</span>
        ) : null}
        {a.challengedByBrainIds.map((id) => {
          const b = getBrain(id);
          return b ? <BrainAvatar key={`c-${id}`} brain={b} size="sm" /> : null;
        })}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        <span className="text-foreground/70">To know: </span>
        {a.evidenceNeeded}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          track("assumption_test_clicked", { assumptionId: a.id });
          try {
            const result = await testAssumptionFn({
              data: { problem, assumption: a.statement, evidenceNeeded: a.evidenceNeeded },
            });
            setTest(result);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not design a test.");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
        Test This Assumption
      </Button>

      {test ? (
        <div className="mt-4 rounded-xl bg-secondary/70 p-4 text-sm">
          <p className="font-display text-base">{test.title}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {test.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p className="mt-2 text-muted-foreground">Timeframe: {test.timeframe}</p>
          <p className="mt-1">
            <span className="text-muted-foreground">Confirms it if: </span>
            {test.successSignal}
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">Breaks it if: </span>
            {test.failureSignal}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function BoardPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const { session, ready, update } = useSession(sessionId);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const started = useRef(false);

  const run = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const board = await generateBoardFn({
        data: {
          problem: session.problem,
          context: session.context,
          brainIds: session.selectedBrainIds,
          interrogation: session.interrogation,
          positions: session.initialPositions,
          debate: session.debateMessages,
          finalPositions: session.finalPositions,
        },
      });
      update({ board });
      track("decision_board_viewed", {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not assemble the board.");
    } finally {
      setLoading(false);
    }
  }, [session, update]);

  useEffect(() => {
    if (!ready || !session || started.current) return;
    started.current = true;
    if (!session.board && session.finalPositions.length > 0) void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session?.id]);

  if (!ready) return <StepFrame step={4} title="Loading" wide />;
  if (!session)
    return (
      <StepFrame step={4} title="This decision has expired" wide>
        <Button onClick={() => navigate({ to: "/" })}>Back to start</Button>
      </StepFrame>
    );

  const board = session.board;

  async function save() {
    if (!session) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: `/d/${sessionId}/board` } });
      return;
    }
    setSaving(true);
    try {
      const { id } = await saveDecisionFn({
        data: {
          title: session.title,
          problem: session.problem,
          context: session.context,
          selectedBrainIds: session.selectedBrainIds,
          interrogation: session.interrogation,
          initialPositions: session.initialPositions,
          debateMessages: session.debateMessages,
          finalPositions: session.finalPositions,
          board: session.board ?? null,
          userDecision: session.userDecision ?? null,
          userConfidence: session.userConfidence ?? null,
          savedId: session.savedId ?? null,
        },
      });
      update({ savedId: id });
      track("user_decision_saved", {});
      toast.success("Saved to your decisions.");
      navigate({ to: "/decisions/$id", params: { id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <StepFrame step={4} title="Decision Board" subtitle={session.problem} wide>
      {loading ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Assembling the board…
        </div>
      ) : null}

      {error ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => void run()}>
            <RefreshCcw className="size-4" /> Try again
          </Button>
        </div>
      ) : null}

      {board ? (
        <div className="space-y-10">
          <section className="rounded-3xl border border-ember/40 bg-ember/6 p-6">
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Where the table lands</p>
            <p className="mt-3 text-2xl leading-snug">{board.headlineRecommendation}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {board.vote.map((v) => (
                <div key={v.option} className="rounded-xl border border-border bg-card px-4 py-3">
                  <p className="text-sm font-medium">{v.option}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="font-display text-lg">{v.count}</span>
                    <span className="flex -space-x-1.5">
                      {v.brainIds.map((id) => {
                        const b = getBrain(id);
                        return b ? <BrainAvatar key={id} brain={b} size="sm" className="ring-2 ring-card" /> : null;
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-sm font-medium">Table confidence</p>
                <p className="mt-1.5 font-display text-lg">{board.confidence}%</p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg">Everyone agrees</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {board.agreements.map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-sage">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg">They split on</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {board.disagreements.map((d, i) => (
                  <li key={i}>
                    <p className="font-medium">{d.issue}</p>
                    <p className="mt-0.5 text-muted-foreground">{d.explanation}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section>
            <h2 className="font-display text-2xl">What this decision turns on</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked by how much the answer changes if the assumption is wrong.
            </p>
            <div className="mt-4 space-y-4">
              {board.assumptions.map((a) => (
                <AssumptionRow key={a.id} a={a} problem={session.problem} />
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg">Strongest argument for</h2>
              <p className="mt-2 text-sm">{board.strongestArgumentFor}</p>
              <h2 className="mt-5 font-display text-lg">Strongest argument against</h2>
              <p className="mt-2 text-sm">{board.strongestArgumentAgainst}</p>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5">
              {board.minorityOpinion ? (
                <>
                  <h2 className="font-display text-lg">
                    Minority opinion
                    {getBrain(board.minorityOpinion.brainId)
                      ? ` — ${getBrain(board.minorityOpinion.brainId)!.name}`
                      : ""}
                  </h2>
                  <p className="mt-2 text-sm">{board.minorityOpinion.argument}</p>
                </>
              ) : null}
              <h2 className="mt-5 font-display text-lg">Least reversible mistake</h2>
              <p className="mt-2 text-sm">{board.leastReversibleMistake}</p>
              <h2 className="mt-5 font-display text-lg">Smallest next action</h2>
              <p className="mt-2 text-sm">{board.smallestNextAction}</p>
            </section>
          </div>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg">What would change this</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {board.whatWouldChangeDecision.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-ember">→</span>
                  {w}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-border bg-secondary/50 p-6">
            <h2 className="font-display text-2xl">You decide.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The table advises. The decision is yours — write it in your own words.
            </p>
            <Textarea
              className="mt-4 min-h-24 bg-background"
              placeholder="What I'm actually going to do…"
              value={session.userDecision ?? ""}
              onChange={(e) => update({ userDecision: e.target.value })}
            />
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">How confident are you?</span>
                <span className="font-display">{session.userConfidence ?? 50}%</span>
              </div>
              <Slider
                className="mt-3"
                value={[session.userConfidence ?? 50]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => update({ userConfidence: v })}
              />
            </div>
            <Button className="mt-6" size="lg" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {user ? "Save decision" : "Sign in to save"}
            </Button>
          </section>
        </div>
      ) : null}
    </StepFrame>
  );
}
