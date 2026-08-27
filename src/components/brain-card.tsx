import { Check } from "lucide-react";

import { BrainAvatar, StatBars } from "@/components/brain-visuals";
import type { Brain } from "@/lib/brains";
import { cn } from "@/lib/utils";

export function BrainCard({
  brain,
  selected,
  disabled,
  onToggle,
}: {
  brain: Brain;
  selected?: boolean | undefined;
  disabled?: boolean | undefined;
  onToggle?: (() => void) | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled && !selected}
      className={cn(
        "group relative flex h-full w-full flex-col gap-3 rounded-2xl border bg-card p-5 text-left transition-all",
        selected
          ? "border-ember/70 shadow-[0_1px_0_0_var(--color-ember-soft),0_10px_30px_-24px_rgba(0,0,0,0.6)]"
          : "border-border hover:border-foreground/25",
        disabled && !selected && "cursor-not-allowed opacity-45",
      )}
    >
      <div className="flex items-start gap-3">
        <BrainAvatar brain={brain} active={selected} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base leading-tight">{brain.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{brain.tagline}</p>
        </div>
        {selected ? (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-ember text-background">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        ) : null}
      </div>

      <p className="text-[13px] leading-relaxed text-muted-foreground">
        <span className="text-foreground/70">Optimizes for </span>
        {brain.optimizesFor.toLowerCase()}
      </p>

      <div className="mt-auto pt-1">
        <StatBars stats={brain.stats} compact />
      </div>
    </button>
  );
}
