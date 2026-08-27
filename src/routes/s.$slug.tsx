import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { BrainAvatar } from "@/components/brain-visuals";
import { Button } from "@/components/ui/button";
import { getBrains } from "@/lib/brains";
import { getSharedDecisionFn } from "@/lib/decisions.functions";

export const Route = createFileRoute("/s/$slug")({
  head: () => ({
    meta: [
      { title: "A shared Decision Board — Borrowed Brain" },
      {
        name: "description",
        content: "Someone put a decision in front of five ways of thinking. This is what the table concluded.",
      },
      { property: "og:title", content: "A shared Decision Board" },
      { property: "og:description", content: "One problem. Five ways of thinking." },
    ],
  }),
  component: SharedDecision,
});

function SharedDecision() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["shared", slug],
    queryFn: () => getSharedDecisionFn({ data: { slug } }),
  });

  if (isLoading)
    return (
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-20 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </div>
    );

  if (!data)
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="text-2xl">This board isn't shared</h1>
        <p className="mt-2 text-sm text-muted-foreground">The link may have been turned off.</p>
        <Button className="mt-5" asChild>
          <Link to="/">Bring your own decision</Link>
        </Button>
      </div>
    );

  const board = data.board;
  const brains = getBrains(data.selected_brain_ids ?? []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">A shared Decision Board</p>
      <h1 className="mt-3 text-3xl">{data.title}</h1>
      <p className="mt-2 text-muted-foreground">{data.problem}</p>
      <div className="mt-4 flex -space-x-1.5">
        {brains.map((b) => (
          <BrainAvatar key={b.id} brain={b} size="sm" className="ring-2 ring-background" />
        ))}
      </div>

      {board ? (
        <>
          <section className="mt-8 rounded-2xl border border-ember/40 bg-ember/6 p-5">
            <p className="text-lg">{board.headlineRecommendation}</p>
            <p className="mt-2 text-sm text-muted-foreground">Table confidence {board.confidence}%</p>
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg">What it turns on</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {board.assumptions.map((a) => (
                <li key={a.id} className="flex gap-2">
                  <span className="text-ember">—</span>
                  {a.statement}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-base">Strongest for</h2>
              <p className="mt-2 text-sm">{board.strongestArgumentFor}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-base">Strongest against</h2>
              <p className="mt-2 text-sm">{board.strongestArgumentAgainst}</p>
            </div>
          </section>
        </>
      ) : null}

      {data.user_decision ? (
        <section className="mt-6 rounded-2xl border border-border bg-secondary/60 p-5">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">They decided</p>
          <p className="mt-2">{data.user_decision}</p>
        </section>
      ) : null}

      <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="font-display text-xl">Put your own decision on the table.</p>
        <Button className="mt-4" asChild>
          <Link to="/">Borrow a brain</Link>
        </Button>
      </div>
    </div>
  );
}
