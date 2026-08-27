import { BrainAvatar } from "@/components/brain-visuals";
import type { Brain } from "@/lib/brains";
import { STANCE_LABEL, type Stance } from "@/lib/decision-types";
import { cn } from "@/lib/utils";

const SHORT_STANCE: Record<Stance, string> = {
  strong_yes: "Strong yes",
  yes: "Yes",
  conditional: "Cond.",
  no: "No",
  strong_no: "Strong no",
};

export function CouncilBar({
  brains,
  speakingId,
  stances,
  changed,
  thinkingIds,
}: {
  brains: Brain[];
  speakingId?: string | null | undefined;
  stances?: Record<string, Stance | undefined> | undefined;
  changed?: Set<string> | undefined;
  thinkingIds?: Set<string> | undefined;
}) {
  return (
    <div className="sticky top-16 z-30 -mx-5 mb-6 border-y border-border/70 bg-background/85 px-5 py-3 backdrop-blur">
      <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
        {brains.map((b) => {
          const speaking = speakingId === b.id;
          const stance = stances?.[b.id];
          const isThinking = thinkingIds?.has(b.id);
          return (
            <div
              key={b.id}
              className={cn(
                "flex min-w-[86px] flex-col items-center gap-1 transition-all duration-300",
                speaking ? "opacity-100" : "opacity-55",
              )}
            >
              <span className={cn("relative inline-flex", speaking && "scale-110")}>
                <BrainAvatar brain={b} size="sm" active={speaking || Boolean(stance)} />
                {speaking || isThinking ? (
                  <span className="absolute -inset-1 animate-ping rounded-full border border-ember/50" />
                ) : null}
              </span>
              <span className="max-w-[92px] truncate text-[11px] text-muted-foreground">{b.name}</span>
              {stance ? (
                <span
                  title={STANCE_LABEL[stance]}
                  className={cn(
                    "seat-in rounded-full border px-1.5 py-0.5 text-[10px] tracking-wide",
                    changed?.has(b.id)
                      ? "border-ember/70 bg-ember/12 text-ember"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {SHORT_STANCE[stance]}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground/60">
                  {isThinking ? "thinking…" : "seated"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RoundStrip({ round }: { round: 1 | 2 | 3 }) {
  const rounds = ["Opening positions", "Cross-examination", "Final positions"];
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.16em] uppercase">
      {rounds.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 transition-colors",
              i + 1 === round
                ? "border-ember/70 bg-ember/10 text-ember"
                : i + 1 < round
                  ? "border-border text-foreground/60"
                  : "border-border/60 text-muted-foreground/60",
            )}
          >
            Round {i + 1} — {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
