import { BrainAvatar } from "@/components/brain-visuals";
import type { Brain } from "@/lib/brains";

export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-ember/70"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "900ms" }}
        />
      ))}
    </span>
  );
}

export function SpeakingIndicator({ brain, verb = "is thinking" }: { brain: Brain; verb?: string }) {
  return (
    <div className="seat-in flex items-center gap-3 rounded-2xl border border-dashed border-ember/40 bg-card/60 px-4 py-3">
      <BrainAvatar brain={brain} size="sm" active />
      <p className="text-sm text-muted-foreground">
        {brain.name} {verb}
      </p>
      <TypingDots />
    </div>
  );
}
