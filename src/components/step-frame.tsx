import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const STEPS = ["Frame", "Questions", "Debate", "Decision"];

export function StepFrame({
  step,
  title,
  subtitle,
  children,
  wide,
}: {
  step: 1 | 2 | 3 | 4;
  title: string;
  subtitle?: string | undefined;
  children?: ReactNode;
  wide?: boolean | undefined;
}) {
  return (
    <div className={cn("mx-auto px-5 py-10", wide ? "max-w-5xl" : "max-w-3xl")}>
      <ol className="flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className={cn(i + 1 === step && "text-ember", i + 1 < step && "text-foreground/60")}>
              {s}
            </span>
            {i < STEPS.length - 1 ? <span className="text-border">—</span> : null}
          </li>
        ))}
      </ol>
      <h1 className="mt-4 text-3xl sm:text-4xl">{title}</h1>
      {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-8">{children}</div>
    </div>
  );
}
