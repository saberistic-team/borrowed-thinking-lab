import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { BrainAvatar } from "@/components/brain-visuals";
import { Button } from "@/components/ui/button";
import { getBrain } from "@/lib/brains";
import {
  STANCE_LABEL,
  type BrainPosition,
  type DebateMessage,
  type UpdatedPosition,
} from "@/lib/decision-types";
import { cn } from "@/lib/utils";

export function TranscriptFeed({ count, children }: { count: number; children: ReactNode }) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const [stuck, setStuck] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const distance =
        document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      setStuck(distance < 260);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (stuck) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <div className="relative">
      <div className="space-y-4">{children}</div>
      <div ref={endRef} className="h-px" />
      {!stuck ? (
        <Button
          size="sm"
          variant="outline"
          className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 shadow-lg"
          onClick={() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })}
        >
          <ArrowDown className="size-4" /> Jump to latest
        </Button>
      ) : null}
    </div>
  );
}

export function RoundHeading({ children }: { children: ReactNode }) {
  return (
    <div className="seat-in flex items-center gap-3 pt-6">
      <span className="h-px flex-1 bg-border" />
      <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{children}</h2>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function PositionTurn({
  position,
  final,
}: {
  position: BrainPosition | UpdatedPosition;
  final?: boolean | undefined;
}) {
  const brain = getBrain(position.brainId);
  const changed = final ? (position as UpdatedPosition).changedMind : false;
  return (
    <article className="seat-in rounded-2xl border border-border bg-card p-5">
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
              <span className="seat-in rounded-full bg-ember/12 px-2 py-0.5 text-xs text-ember">
                Changed mind
              </span>
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
    </article>
  );
}

export function ExchangeTurn({ message }: { message: DebateMessage }) {
  const from = getBrain(message.fromBrainId);
  const to = getBrain(message.toBrainId);
  return (
    <article className="seat-in space-y-2">
      <div className="flex justify-start">
        <div className="max-w-[86%] rounded-2xl rounded-tl-sm border border-ember/40 bg-ember/[0.06] p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {from ? <BrainAvatar brain={from} size="sm" active /> : null}
            <span className="font-medium">{from?.name}</span>
            <span className="text-muted-foreground">challenges {to?.name}</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
              {message.disagreementType.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-2 leading-relaxed">{message.challenge}</p>
        </div>
      </div>
      <div className="flex justify-end">
        <div className={cn("max-w-[86%] rounded-2xl rounded-tr-sm border border-border bg-card p-4")}>
          <div className="flex items-center justify-end gap-2 text-sm">
            <span className="font-medium">{to?.name}</span>
            {to ? <BrainAvatar brain={to} size="sm" /> : null}
          </div>
          <p className="mt-2 text-right leading-relaxed text-muted-foreground">{message.response}</p>
        </div>
      </div>
    </article>
  );
}
