import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BrainAvatar } from "@/components/brain-visuals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { track } from "@/lib/analytics";
import { getBrain, getBrains } from "@/lib/brains";
import { getDecisionFn, submitReviewFn, updateDecisionFn } from "@/lib/decisions.functions";
import type { DecisionBoard, ShareMode } from "@/lib/decision-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/decisions/$id")({
  head: () => ({
    meta: [
      { title: "Decision — Borrowed Brain" },
      { name: "description", content: "Your saved decision, its board, your choice, and its review." },
      { property: "og:title", content: "A saved decision" },
      { property: "og:description", content: "The board, the choice, and how it turned out." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DecisionDetail,
});

const OUTCOMES = [
  { value: "better", label: "Better than expected" },
  { value: "as_expected", label: "About as expected" },
  { value: "worse", label: "Worse than expected" },
  { value: "too_early", label: "Too early to tell" },
] as const;

const SHARE_OPTIONS: { value: ShareMode; label: string; hint: string }[] = [
  { value: "private", label: "Private", hint: "Only you" },
  { value: "board", label: "Board only", hint: "Hides your problem text and context" },
  { value: "no_context", label: "Problem + board", hint: "Hides your private context" },
  { value: "full", label: "Everything", hint: "Includes the context you gave" },
];

function DecisionDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState<(typeof OUTCOMES)[number]["value"] | null>(null);
  const [usefulBrain, setUsefulBrain] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["decision", id],
    enabled: Boolean(user),
    queryFn: () => getDecisionFn({ data: { id } }),
  });

  const share = useMutation({
    mutationFn: (shareMode: ShareMode) => updateDecisionFn({ data: { id, shareMode } }),
    onSuccess: (res) => {
      track("decision_shared", { mode: String(res.share_mode) });
      qc.invalidateQueries({ queryKey: ["decision", id] });
    },
    onError: () => toast.error("Could not update sharing."),
  });

  const review = useMutation({
    mutationFn: () =>
      submitReviewFn({
        data: {
          decisionId: id,
          outcome: outcome!,
          notes: notes || undefined,
          mostUsefulBrainId: usefulBrain ?? undefined,
        },
      }),
    onSuccess: () => {
      track("decision_review_completed", { outcome: outcome ?? "" });
      toast.success("Review saved.");
      setNotes("");
      setOutcome(null);
      qc.invalidateQueries({ queryKey: ["decision", id] });
    },
    onError: () => toast.error("Could not save the review."),
  });

  if (!loading && !user)
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="text-2xl">Sign in to see this decision</h1>
        <Button className="mt-5" onClick={() => navigate({ to: "/auth", search: { redirect: `/decisions/${id}` } })}>
          Sign in
        </Button>
      </div>
    );

  if (isLoading || !data)
    return (
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-20 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </div>
    );

  const d = data.decision as Record<string, unknown>;
  const board = d["board"] as DecisionBoard | null;
  const brains = getBrains((d["selected_brain_ids"] as string[]) ?? []);
  const shareMode = (d["share_mode"] as ShareMode) ?? "private";
  const shareSlug = d["share_slug"] as string | null;
  const shareUrl = shareSlug && typeof window !== "undefined" ? `${window.location.origin}/s/${shareSlug}` : null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/decisions" className="text-sm text-muted-foreground hover:text-foreground">
        ← All decisions
      </Link>
      <h1 className="mt-5 text-3xl">{d["title"] as string}</h1>
      <p className="mt-2 text-muted-foreground">{d["problem"] as string}</p>
      <div className="mt-4 flex -space-x-1.5">
        {brains.map((b) => (
          <BrainAvatar key={b.id} brain={b} size="sm" className="ring-2 ring-background" />
        ))}
      </div>

      {d["user_decision"] ? (
        <section className="mt-8 rounded-2xl border border-ember/40 bg-ember/6 p-5">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">You decided</p>
          <p className="mt-2 leading-relaxed">{d["user_decision"] as string}</p>
          {d["user_confidence"] != null ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {String(d["user_confidence"])}% confident at the time
            </p>
          ) : null}
        </section>
      ) : null}

      {board ? (
        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg">The table's read</h2>
          <p className="mt-2">{board.headlineRecommendation}</p>
          <h3 className="mt-5 text-xs tracking-[0.18em] text-muted-foreground uppercase">Key assumptions</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {board.assumptions.slice(0, 5).map((a) => (
              <li key={a.id} className="flex gap-2">
                <span className="text-ember">—</span>
                {a.statement}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm">
            <span className="text-muted-foreground">Smallest next action: </span>
            {board.smallestNextAction}
          </p>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg">Share</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SHARE_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => share.mutate(o.value)}
              className={cn(
                "rounded-xl border p-3 text-left text-sm transition-colors",
                shareMode === o.value ? "border-ember bg-ember/8" : "border-border hover:border-foreground/25",
              )}
            >
              <p className="font-medium">{o.label}</p>
              <p className="text-xs text-muted-foreground">{o.hint}</p>
            </button>
          ))}
        </div>
        {shareUrl ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <span className="truncate">{shareUrl}</span>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto"
              onClick={() => {
                void navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg">How did it turn out?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {OUTCOMES.map((o) => (
            <button
              key={o.value}
              onClick={() => setOutcome(o.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                outcome === o.value ? "border-ember bg-ember/10" : "border-border text-muted-foreground",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Which brain turned out to be right?
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {brains.map((b) => (
            <button
              key={b.id}
              onClick={() => setUsefulBrain(b.id)}
              className={cn(
                "flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm",
                usefulBrain === b.id ? "border-ember bg-ember/10" : "border-border text-muted-foreground",
              )}
            >
              <BrainAvatar brain={b} size="sm" active={usefulBrain === b.id} />
              {b.name}
            </button>
          ))}
        </div>
        <Textarea
          className="mt-4 bg-background"
          placeholder="What actually happened?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button className="mt-4" disabled={!outcome || review.isPending} onClick={() => review.mutate()}>
          {review.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save review
        </Button>
      </section>

      {data.reviews.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-display text-lg">Past reviews</h2>
          <div className="mt-3 space-y-3">
            {data.reviews.map((r) => {
              const row = r as Record<string, unknown>;
              const brain = row["most_useful_brain_id"] ? getBrain(row["most_useful_brain_id"] as string) : null;
              return (
                <div key={row["id"] as string} className="rounded-xl border border-border bg-card p-4 text-sm">
                  <p className="font-medium">
                    {OUTCOMES.find((o) => o.value === row["outcome"])?.label ?? (row["outcome"] as string)}
                  </p>
                  {row["notes"] ? <p className="mt-1 text-muted-foreground">{row["notes"] as string}</p> : null}
                  {brain ? <p className="mt-1 text-xs text-muted-foreground">Most useful: {brain.name}</p> : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
