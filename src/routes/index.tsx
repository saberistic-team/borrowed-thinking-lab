import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BrainAvatar } from "@/components/brain-visuals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";
import { BRAINS, ROUNDTABLES, getBrains } from "@/lib/brains";
import { createSession, listLocalSessions } from "@/lib/session-store";
import type { DecisionSession } from "@/lib/decision-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Borrowed Brain — one problem, five ways of thinking" },
      {
        name: "description",
        content:
          "Bring a real decision. Borrow up to five thinking styles, watch them interrogate and debate it, and leave with the assumptions your decision actually turns on.",
      },
      { property: "og:title", content: "Borrow another brain" },
      { property: "og:description", content: "One problem. Five ways of thinking." },
    ],
  }),
  component: Home,
});

const EXAMPLES = [
  "Should I launch this product now?",
  "Should I take this job?",
  "Should I raise my price?",
  "Should I move to another city?",
  "How should I handle this disagreement?",
  "Should I end this business partnership?",
];

function Home() {
  const navigate = useNavigate();
  const [problem, setProblem] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [recent, setRecent] = useState<DecisionSession[]>([]);

  useEffect(() => {
    const t = setInterval(() => setExampleIndex((i) => (i + 1) % EXAMPLES.length), 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => setRecent(listLocalSessions().slice(0, 3)), []);

  const popular = useMemo(
    () => getBrains(["operator", "skeptic", "investor", "eighty-year-old-you", "empath", "contrarian"]),
    [],
  );

  function start(text: string) {
    const value = text.trim();
    if (!value) return;
    const session = createSession(value);
    track("decision_started", { length: value.length });
    navigate({ to: "/d/$sessionId/setup", params: { sessionId: session.id } });
  }

  return (
    <div>
      <section className="chamber-grain relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-5 pt-20 pb-14 text-center sm:pt-28">
          <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
            A small council chamber for one decision
          </p>
          <h1 className="mt-5 text-4xl leading-[1.05] sm:text-6xl">Borrow another brain.</h1>
          <p className="mt-4 text-lg text-muted-foreground">One problem. Five ways of thinking.</p>

          <div className="mt-10 rounded-3xl border border-border bg-card p-3 text-left shadow-[0_24px_60px_-50px_rgba(0,0,0,0.8)]">
            <label htmlFor="problem" className="sr-only">
              What are you trying to decide?
            </label>
            <Textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder={`What are you trying to decide?  e.g. ${EXAMPLES[exampleIndex]}`}
              className="min-h-32 resize-none border-0 bg-transparent px-4 py-3 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) start(problem);
              }}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1">
              <span className="text-xs text-muted-foreground">
                Be specific. The table works with what you give it.
              </span>
              <Button size="lg" onClick={() => start(problem)} disabled={problem.trim().length < 4}>
                Think About It
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {EXAMPLES.slice(0, 4).map((e) => (
              <button
                key={e}
                onClick={() => setProblem(e)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </section>

      {recent.length > 0 ? (
        <section className="mx-auto max-w-5xl px-5 pb-4">
          <h2 className="text-sm tracking-wide text-muted-foreground uppercase">In progress</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {recent.map((s) => (
              <Link
                key={s.id}
                to="/d/$sessionId/setup"
                params={{ sessionId: s.id }}
                className="rounded-xl border border-border bg-card p-4 text-sm transition-colors hover:border-foreground/25"
              >
                <p className="line-clamp-2 text-foreground">{s.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Councils that already work</h2>
          <Link to="/roundtables" className="text-sm text-ember hover:underline">
            All roundtables
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROUNDTABLES.slice(0, 3).map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-lg">{r.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.tagline}</p>
              <div className="mt-4 flex -space-x-2">
                {getBrains(r.brainIds).map((b) => (
                  <BrainAvatar key={b.id} brain={b} size="sm" className="ring-2 ring-card" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Brains people borrow most</h2>
          <Link to="/brains" className="text-sm text-ember hover:underline">
            All {BRAINS.length} brains
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((b) => (
            <Link
              key={b.id}
              to="/brains/$slug"
              params={{ slug: b.slug }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/25"
            >
              <BrainAvatar brain={b} />
              <div className="min-w-0">
                <p className="font-display text-base">{b.name}</p>
                <p className="truncate text-sm text-muted-foreground">{b.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
