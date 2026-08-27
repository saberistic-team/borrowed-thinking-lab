import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { BrainAvatar } from "@/components/brain-visuals";
import { Button } from "@/components/ui/button";
import { ROUNDTABLES, getBrains } from "@/lib/brains";
import { createSession, saveSession } from "@/lib/session-store";

export const Route = createFileRoute("/roundtables")({
  head: () => ({
    meta: [
      { title: "Roundtables — Borrowed Brain" },
      {
        name: "description",
        content: "Prebuilt councils of thinking styles chosen to disagree usefully about a kind of decision.",
      },
      { property: "og:title", content: "Roundtables" },
      { property: "og:description", content: "Councils built to disagree usefully." },
    ],
  }),
  component: Roundtables,
});

function Roundtables() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-4xl">Roundtables</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Councils assembled so their disagreements are the useful kind. Start with one, then swap seats.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {ROUNDTABLES.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">{r.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{r.tagline}</p>
            <div className="mt-4 space-y-2">
              {getBrains(r.brainIds).map((b) => (
                <div key={b.id} className="flex items-center gap-2.5 text-sm">
                  <BrainAvatar brain={b} size="sm" />
                  <span>{b.name}</span>
                  <span className="truncate text-muted-foreground">{b.tagline}</span>
                </div>
              ))}
            </div>
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => {
                const session = createSession("");
                saveSession({ ...session, selectedBrainIds: r.brainIds, title: r.name });
                navigate({ to: "/d/$sessionId/setup", params: { sessionId: session.id } });
              }}
            >
              Use this council
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
