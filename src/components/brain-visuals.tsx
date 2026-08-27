import {
  ArrowLeftRight,
  FlaskConical,
  Handshake,
  Heart,
  Hourglass,
  Layers,
  Minus,
  Search,
  Shield,
  Crown,
  Sunrise,
  TrendingUp,
  User,
  Wrench,
  Brain as BrainIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Brain, BrainStats } from "@/lib/brains";

const ICONS: Record<string, LucideIcon> = {
  wrench: Wrench,
  search: Search,
  sunrise: Sunrise,
  "trending-up": TrendingUp,
  flask: FlaskConical,
  minus: Minus,
  flip: ArrowLeftRight,
  handshake: Handshake,
  chess: Crown,
  shield: Shield,
  heart: Heart,
  user: User,
  hourglass: Hourglass,
  layers: Layers,
};

const SIZES = {
  sm: "size-8 [&>svg]:size-4",
  md: "size-11 [&>svg]:size-5",
  lg: "size-16 [&>svg]:size-7",
} as const;

export function BrainAvatar({
  brain,
  size = "md",
  active,
  className,
}: {
  brain: Brain;
  size?: keyof typeof SIZES | undefined;
  active?: boolean | undefined;
  className?: string | undefined;
}) {
  const Icon = ICONS[brain.icon] ?? BrainIcon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border transition-colors",
        active
          ? "border-ember bg-ember/12 text-ember"
          : "border-border bg-secondary text-muted-foreground",
        SIZES[size],
        className,
      )}
      aria-hidden
    >
      <Icon strokeWidth={1.6} />
    </span>
  );
}

const STAT_LABELS: { key: keyof BrainStats; label: string }[] = [
  { key: "actionOrientation", label: "Action" },
  { key: "caution", label: "Caution" },
  { key: "evidenceOrientation", label: "Evidence" },
  { key: "creativity", label: "Creativity" },
  { key: "riskTolerance", label: "Risk appetite" },
  { key: "empathy", label: "Empathy" },
  { key: "complexityTolerance", label: "Complexity" },
];

export function StatBars({ stats, compact }: { stats: BrainStats; compact?: boolean | undefined }) {
  const rows = compact ? STAT_LABELS.slice(0, 3) : STAT_LABELS;
  return (
    <dl className="space-y-1.5">
      {rows.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <dt className="w-24 shrink-0 text-[11px] tracking-wide text-muted-foreground uppercase">
            {label}
          </dt>
          <dd className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-ember/70" style={{ width: `${stats[key]}%` }} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
