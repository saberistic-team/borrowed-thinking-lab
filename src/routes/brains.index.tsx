import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { BrainAvatar, StatBars } from "@/components/brain-visuals";
import { BRAINS, BRAIN_CATEGORIES } from "@/lib/brains";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/brains/")({
  head: () => ({
    meta: [
      { title: "The Brains — Borrowed Brain" },
      {
        name: "description",
        content:
          "Fourteen thinking styles with genuinely different worldviews, priorities, decision rules and blind spots.",
      },
      { property: "og:title", content: "The Brains" },
      { property: "og:description", content: "Fourteen worldviews you can borrow." },
    ],
  }),
  component: BrainsIndex,
});

function BrainsIndex() {
  const [category, setCategory] = useState<string>("All");
  const list = category === "All" ? BRAINS : BRAINS.filter((b) => b.category === category);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-4xl">The Brains</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Each one wants something different from your life. That is the point — a table that agrees is
        just you, louder.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["All", ...BRAIN_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              category === c
                ? "border-ember bg-ember/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((b) => (
          <Link
            key={b.id}
            to="/brains/$slug"
            params={{ slug: b.slug }}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/25"
          >
            <div className="flex items-start gap-3">
              <BrainAvatar brain={b} />
              <div>
                <h2 className="font-display text-base">{b.name}</h2>
                <p className="text-sm text-muted-foreground">{b.tagline}</p>
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground">{b.description}</p>
            <div className="mt-auto">
              <StatBars stats={b.stats} compact />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
