import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { BrainAvatar, StatBars } from "@/components/brain-visuals";
import { BRAINS, ROUNDTABLES } from "@/lib/brains";

export const Route = createFileRoute("/brains/$slug")({
  loader: ({ params }) => {
    const brain = BRAINS.find((b) => b.slug === params.slug);
    if (!brain) throw notFound();
    return { brain };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Brain not found — Borrowed Brain" }, { name: "robots", content: "noindex" }] };
    const { brain } = loaderData;
    return {
      meta: [
        { title: `${brain.name} — Borrowed Brain` },
        { name: "description", content: `${brain.tagline} ${brain.description}`.slice(0, 155) },
        { property: "og:title", content: `${brain.name} — a brain you can borrow` },
        { property: "og:description", content: brain.tagline },
      ],
    };
  },
  component: BrainDetail,
});

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((i, k) => (
          <li key={k} className="flex gap-2">
            <span className="text-ember">—</span>
            {i}
          </li>
        ))}
      </ul>
    </section>
  );
}

function BrainDetail() {
  const { brain } = Route.useLoaderData();
  const councils = ROUNDTABLES.filter((r) => r.brainIds.includes(brain.id));

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link to="/brains" className="text-sm text-muted-foreground hover:text-foreground">
        ← All brains
      </Link>
      <div className="mt-6 flex flex-wrap items-start gap-5">
        <BrainAvatar brain={brain} size="lg" active />
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl">{brain.name}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{brain.tagline}</p>
          <p className="mt-4 max-w-2xl leading-relaxed">{brain.description}</p>
          <p className="mt-3 text-sm">
            <span className="text-muted-foreground">Optimizes for: </span>
            {brain.optimizesFor}
          </p>
          <p className="mt-1 text-sm">
            <span className="text-muted-foreground">Time horizon: </span>
            {brain.timeHorizon.replace("-", " ")}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <StatBars stats={brain.stats} />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Section title="Priorities" items={brain.priorities} />
        <Section title="Beliefs" items={brain.beliefs} />
        <Section title="Decision rules" items={brain.decisionRules} />
        <Section title="Questions it always asks" items={brain.characteristicQuestions} />
        <Section title="Blind spots" items={brain.blindSpots} />
        <Section title="What changes its mind" items={brain.changeMindConditions} />
      </div>

      {councils.length ? (
        <section className="mt-8">
          <h2 className="font-display text-lg">Sits on</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {councils.map((c) => (
              <Link
                key={c.id}
                to="/roundtables"
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
