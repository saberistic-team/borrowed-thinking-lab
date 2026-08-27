import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FastForward, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CouncilBar, RoundStrip } from "@/components/council-bar";
import {
  ExchangeTurn,
  PositionTurn,
  RoundHeading,
  TranscriptFeed,
} from "@/components/debate-transcript";
import { SpeakingIndicator } from "@/components/speaking-indicator";
import { StepFrame } from "@/components/step-frame";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { getBrain, getBrains } from "@/lib/brains";
import {
  generateCrossExaminationFn,
  generateFinalPositionForBrainFn,
  generatePositionForBrainFn,
} from "@/lib/decisions.functions";
import type {
  BrainPosition,
  DebateMessage,
  Stance,
  UpdatedPosition,
} from "@/lib/decision-types";
import { useRevealQueue } from "@/hooks/use-reveal-queue";
import { useSession } from "@/lib/session-store";

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

type Turn =
  | { kind: "round"; round: 1 | 2 | 3; speaker: string }
  | { kind: "position"; position: BrainPosition; speaker: string }
  | { kind: "exchange"; message: DebateMessage; speaker: string }
  | { kind: "final"; position: UpdatedPosition; speaker: string };

const ROUND_TITLE: Record<1 | 2 | 3, string> = {
  1: "Round 1 — each brain speaks alone",
  2: "Round 2 — cross-examination",
  3: "Round 3 — final positions",
};

function DebatePage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const { session, ready, update } = useSession(sessionId);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState<1 | 2 | 3>(1);
  const [thinking, setThinking] = useState<Set<string>>(new Set());
  const started = useRef(false);

  const { revealed, pending, speakingId, push, seed, skip, reset, instant } = useRevealQueue<Turn>(
    (t) => t.speaker,
  );

  const brains = useMemo(() => getBrains(session?.selectedBrainIds ?? []), [session?.selectedBrainIds]);

  const stances = useMemo(() => {
    const map: Record<string, Stance | undefined> = {};
    for (const turn of revealed) {
      if (turn.kind === "position" || turn.kind === "final") map[turn.position.brainId] = turn.position.stance;
    }
    return map;
  }, [revealed]);

  const changed = useMemo(() => {
    const set = new Set<string>();
    for (const turn of revealed) {
      if (turn.kind === "final" && turn.position.changedMind) set.add(turn.position.brainId);
    }
    return set;
  }, [revealed]);

  const run = useCallback(async () => {
    const current = session;
    if (!current) return;
    setError(null);
    setRunning(true);
    reset();
    const base = {
      problem: current.problem,
      context: current.context,
      brainIds: current.selectedBrainIds,
      interrogation: current.interrogation,
    };
    const ids = current.selectedBrainIds;

    try {
      track("debate_started", { brains: ids.length });

      /* ---------------------------- round 1 ---------------------------- */
      setRound(1);
      setThinking(new Set(ids));
      push({ kind: "round", round: 1, speaker: ids[0] ?? "" });

      const positions: BrainPosition[] = [];
      await Promise.all(
        ids.map(async (brainId) => {
          const position = await generatePositionForBrainFn({ data: { ...base, brainId } });
          positions.push(position);
          setThinking((prev) => {
            const next = new Set(prev);
            next.delete(brainId);
            return next;
          });
          push({ kind: "position", position, speaker: brainId });
          update({ initialPositions: [...positions] });
        }),
      );

      /* ---------------------------- round 2 ---------------------------- */
      setRound(2);
      setThinking(new Set(ids));
      push({ kind: "round", round: 2, speaker: ids[0] ?? "" });
      const debate = await generateCrossExaminationFn({ data: { ...base, positions } });
      setThinking(new Set());
      update({ debateMessages: debate });
      debate.forEach((message) => push({ kind: "exchange", message, speaker: message.fromBrainId }));

      /* ---------------------------- round 3 ---------------------------- */
      setRound(3);
      setThinking(new Set(ids));
      push({ kind: "round", round: 3, speaker: ids[0] ?? "" });
      const finals: UpdatedPosition[] = [];
      await Promise.all(
        ids.map(async (brainId) => {
          const position = await generateFinalPositionForBrainFn({
            data: { ...base, brainId, positions, debate },
          });
          finals.push(position);
          setThinking((prev) => {
            const next = new Set(prev);
            next.delete(brainId);
            return next;
          });
          push({ kind: "final", position, speaker: brainId });
          if (position.changedMind) track("brain_changed_mind", { brainId });
          update({ finalPositions: [...finals] });
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "The roundtable broke down.");
    } finally {
      setThinking(new Set());
      setRunning(false);
    }
  }, [session, update, push, reset]);

  useEffect(() => {
    if (!ready || !session || started.current) return;
    started.current = true;
    if (session.finalPositions.length > 0) {
      // Resume: replay the whole transcript instantly.
      const turns: Turn[] = [
        { kind: "round", round: 1, speaker: "" },
        ...session.initialPositions.map<Turn>((position) => ({
          kind: "position",
          position,
          speaker: position.brainId,
        })),
        { kind: "round", round: 2, speaker: "" },
        ...session.debateMessages.map<Turn>((message) => ({
          kind: "exchange",
          message,
          speaker: message.fromBrainId,
        })),
        { kind: "round", round: 3, speaker: "" },
        ...session.finalPositions.map<Turn>((position) => ({
          kind: "final",
          position,
          speaker: position.brainId,
        })),
      ];
      seed(turns);
      setRound(3);
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

  const speakingBrain = speakingId ? getBrain(speakingId) : undefined;
  const thinkingBrains = brains.filter((b) => thinking.has(b.id));
  const finished = !running && pending === 0 && session.finalPositions.length > 0;

  return (
    <StepFrame
      step={3}
      title="The Roundtable"
      subtitle={finished ? "The table has finished." : ROUND_TITLE[round]}
      wide
    >
      <CouncilBar
        brains={brains}
        speakingId={speakingId}
        stances={stances}
        changed={changed}
        thinkingIds={thinking}
      />

      <RoundStrip round={round} />

      {error ? (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => void run()}>
            <RefreshCcw className="size-4" /> Try again
          </Button>
        </div>
      ) : null}

      <TranscriptFeed count={revealed.length + (speakingId ? 1 : 0)}>
        {revealed.map((turn, i) => {
          if (turn.kind === "round") return <RoundHeading key={`r${i}`}>{ROUND_TITLE[turn.round]}</RoundHeading>;
          if (turn.kind === "exchange") return <ExchangeTurn key={`e${i}`} message={turn.message} />;
          return <PositionTurn key={`p${i}`} position={turn.position} final={turn.kind === "final"} />;
        })}

        {speakingBrain ? <SpeakingIndicator brain={speakingBrain} verb="is speaking" /> : null}

        {!speakingBrain && thinkingBrains.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {thinkingBrains.map((b) => (
              <SpeakingIndicator key={b.id} brain={b} />
            ))}
          </div>
        ) : null}
      </TranscriptFeed>

      <div className="sticky bottom-0 mt-10 -mx-5 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/90 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {finished
              ? changed.size > 0
                ? `${changed.size} brain${changed.size === 1 ? "" : "s"} changed their mind.`
                : "Nobody moved. The disagreement is real."
              : "The table is in session…"}
          </p>
          {!instant && (pending > 0 || running) ? (
            <Button size="sm" variant="ghost" onClick={skip}>
              <FastForward className="size-4" /> Skip the theatre
            </Button>
          ) : null}
        </div>
        <Button
          size="lg"
          disabled={session.finalPositions.length === 0}
          onClick={() => navigate({ to: "/d/$sessionId/board", params: { sessionId } })}
        >
          Decision Board
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </StepFrame>
  );
}
