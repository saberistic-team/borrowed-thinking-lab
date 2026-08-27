import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { BrainAvatar } from "@/components/brain-visuals";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getBrains } from "@/lib/brains";
import { listDecisionsFn } from "@/lib/decisions.functions";
import { listLocalSessions } from "@/lib/session-store";
import type { DecisionSession } from "@/lib/decision-types";

export const Route = createFileRoute("/decisions/")({
  head: () => ({
    meta: [
      { title: "Your decisions — Borrowed Brain" },
      { name: "description", content: "Every decision you put on the table, what you chose, and how it turned out." },
      { property: "og:title", content: "Your decisions" },
      { property: "og:description", content: "What you decided, and how it turned out." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DecisionsPage,
});

function DecisionsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [local, setLocal] = useState<DecisionSession[]>([]);

  useEffect(() => setLocal(listLocalSessions()), []);

  const { data, isLoading } = useQuery({
    queryKey: ["decisions", user?.id],
    enabled: Boolean(user),
    queryFn: () => listDecisionsFn(),
  });

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Your decisions</h1>
        <Button onClick={() => navigate({ to: "/" })}>New decision</Button>
      </div>

      {!loading && !user ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm">
          <p>Decisions on this device are kept in your browser only.</p>
          <Button variant="outline" className="mt-3" onClick={() => navigate({ to: "/auth" })}>
            Sign in to keep them
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      ) : null}

      {data && data.length > 0 ? (
        <section className="mt-8 space-y-3">
          {data.map((d) => (
            <Link
              key={d.id}
              to="/decisions/$id"
              params={{ id: d.id as string }}
              className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/25"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-lg">{d.title as string}</h2>
                {d.review_at ? (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    Review {new Date(d.review_at as string).toLocaleDateString()}
                  </span>
                ) : null}
                {d.outcome ? (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{d.outcome as string}</span>
                ) : null}
              </div>
              {d.user_decision ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.user_decision as string}</p>
              ) : null}
              <div className="mt-3 flex -space-x-1.5">
                {getBrains((d.selected_brain_ids as string[]) ?? []).map((b) => (
                  <BrainAvatar key={b.id} brain={b} size="sm" className="ring-2 ring-card" />
                ))}
              </div>
            </Link>
          ))}
        </section>
      ) : null}

      {local.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.18em] text-muted-foreground uppercase">On this device</h2>
          <div className="mt-3 space-y-3">
            {local.map((s) => (
              <Link
                key={s.id}
                to="/d/$sessionId/setup"
                params={{ sessionId: s.id }}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/25"
              >
                <p className="font-display">{s.title || "Untitled decision"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(s.createdAt).toLocaleString()} · {s.selectedBrainIds.length} brains
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
