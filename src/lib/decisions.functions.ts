import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

import type { DecisionContext, InterrogationItem, BrainPosition, DebateMessage, UpdatedPosition, DecisionBoard } from "./decision-types";

const contextSchema = z.object({
  background: z.string().optional(),
  constraints: z.string().optional(),
  desiredOutcome: z.string().optional(),
  deadline: z.string().optional(),
  moneyInvolved: z.string().optional(),
  peopleInvolved: z.string().optional(),
  alternatives: z.string().optional(),
});

const baseSchema = z.object({
  problem: z.string().min(3).max(4000),
  context: contextSchema.default({}),
  brainIds: z.array(z.string()).min(1).max(5),
  interrogation: z
    .array(z.object({ brainId: z.string(), question: z.string(), answer: z.string().optional() }))
    .default([]),
});

export const recommendSetupFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ problem: z.string().min(3).max(4000) }).parse(d))
  .handler(async ({ data }) => {
    const { recommendSetup } = await import("./orchestration.server");
    return recommendSetup(data.problem);
  });

export const generateQuestionsFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => baseSchema.parse(d))
  .handler(async ({ data }) => {
    const { generateQuestions } = await import("./orchestration.server");
    return generateQuestions(data.problem, data.context as DecisionContext, data.brainIds);
  });

const brainTurnSchema = baseSchema.extend({ brainId: z.string().min(1) });

export const generateQuestionForBrainFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => brainTurnSchema.parse(d))
  .handler(async ({ data }) => {
    const { generateQuestionForBrain } = await import("./orchestration.server");
    return generateQuestionForBrain(
      data.problem,
      data.context as DecisionContext,
      data.brainId,
      data.brainIds,
    );
  });

export const generatePositionForBrainFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => brainTurnSchema.parse(d))
  .handler(async ({ data }) => {
    const { generatePositionForBrain } = await import("./orchestration.server");
    return generatePositionForBrain(
      data.problem,
      data.context as DecisionContext,
      data.brainId,
      data.interrogation as InterrogationItem[],
    );
  });

export const generateFinalPositionForBrainFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    brainTurnSchema.extend({ positions: z.array(z.any()), debate: z.array(z.any()) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { generateFinalPositionForBrain } = await import("./orchestration.server");
    return generateFinalPositionForBrain(
      data.problem,
      data.context as DecisionContext,
      data.brainId,
      data.interrogation as InterrogationItem[],
      data.positions as BrainPosition[],
      data.debate as DebateMessage[],
    );
  });

export const generatePositionsFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => baseSchema.parse(d))
  .handler(async ({ data }) => {
    const { generatePositions } = await import("./orchestration.server");
    return generatePositions(
      data.problem,
      data.context as DecisionContext,
      data.brainIds,
      data.interrogation as InterrogationItem[],
    );
  });


const positionsInput = baseSchema.extend({ positions: z.array(z.any()) });

export const generateCrossExaminationFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => positionsInput.parse(d))
  .handler(async ({ data }) => {
    const { generateCrossExamination } = await import("./orchestration.server");
    return generateCrossExamination(
      data.problem,
      data.context as DecisionContext,
      data.brainIds,
      data.interrogation as InterrogationItem[],
      data.positions as BrainPosition[],
    );
  });

const debateInput = positionsInput.extend({ debate: z.array(z.any()) });

export const generateFinalPositionsFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => debateInput.parse(d))
  .handler(async ({ data }) => {
    const { generateFinalPositions } = await import("./orchestration.server");
    return generateFinalPositions(
      data.problem,
      data.context as DecisionContext,
      data.brainIds,
      data.interrogation as InterrogationItem[],
      data.positions as BrainPosition[],
      data.debate as DebateMessage[],
    );
  });

const boardInput = debateInput.extend({ finalPositions: z.array(z.any()) });

export const generateBoardFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => boardInput.parse(d))
  .handler(async ({ data }) => {
    const { generateBoard } = await import("./orchestration.server");
    return generateBoard(
      data.problem,
      data.context as DecisionContext,
      data.brainIds,
      data.interrogation as InterrogationItem[],
      data.positions as BrainPosition[],
      data.debate as DebateMessage[],
      data.finalPositions as UpdatedPosition[],
    );
  });

export const testAssumptionFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        problem: z.string().min(3),
        assumption: z.string().min(3),
        evidenceNeeded: z.string().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { generateAssumptionTest } = await import("./orchestration.server");
    return generateAssumptionTest(data.problem, data.assumption, data.evidenceNeeded);
  });

/* ------------------------------ persistence ------------------------------- */

const sessionSchema = z.object({
  title: z.string().min(1),
  problem: z.string().min(1),
  context: contextSchema.default({}),
  selectedBrainIds: z.array(z.string()),
  interrogation: z.array(z.any()).default([]),
  initialPositions: z.array(z.any()).default([]),
  debateMessages: z.array(z.any()).default([]),
  finalPositions: z.array(z.any()).default([]),
  board: z.any().nullable().optional(),
  userDecision: z.string().nullable().optional(),
  userConfidence: z.number().nullable().optional(),
  reviewAt: z.string().nullable().optional(),
  savedId: z.string().nullable().optional(),
});

export const saveDecisionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => sessionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      title: data.title,
      problem: data.problem,
      context: data.context,
      selected_brain_ids: data.selectedBrainIds,
      interrogation: data.interrogation,
      initial_positions: data.initialPositions,
      debate_messages: data.debateMessages,
      final_positions: data.finalPositions,
      board: data.board ?? null,
      user_decision: data.userDecision ?? null,
      user_confidence: data.userConfidence ?? null,
      review_at: data.reviewAt ?? null,
    };
    if (data.savedId) {
      const { data: updated, error } = await context.supabase
        .from("decisions")
        .update(row)
        .eq("id", data.savedId)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: updated.id as string };
    }
    const { data: inserted, error } = await context.supabase
      .from("decisions")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id as string };
  });

export const listDecisionsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("decisions")
      .select(
        "id,title,problem,selected_brain_ids,board,user_decision,user_confidence,review_at,outcome,share_mode,share_slug,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getDecisionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("decisions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Decision not found");
    const { data: reviews } = await context.supabase
      .from("decision_reviews")
      .select("*")
      .eq("decision_id", data.id)
      .order("created_at", { ascending: false });
    return { decision: row, reviews: reviews ?? [] };
  });

export const updateDecisionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        userDecision: z.string().nullable().optional(),
        userConfidence: z.number().min(0).max(100).nullable().optional(),
        reviewAt: z.string().nullable().optional(),
        shareMode: z.enum(["private", "board", "no_context", "full"]).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.userDecision !== undefined) patch["user_decision"] = data.userDecision;
    if (data.userConfidence !== undefined) patch["user_confidence"] = data.userConfidence;
    if (data.reviewAt !== undefined) patch["review_at"] = data.reviewAt;
    if (data.shareMode !== undefined) {
      patch["share_mode"] = data.shareMode;
      patch["share_slug"] =
        data.shareMode === "private" ? null : `${data.id.slice(0, 8)}${Math.random().toString(36).slice(2, 8)}`;
    }
    const { data: updated, error } = await context.supabase
      .from("decisions")
      .update(patch as never)
      .eq("id", data.id)
      .select("id,share_mode,share_slug")
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });

export const submitReviewFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        decisionId: z.string().uuid(),
        outcome: z.enum(["better", "as_expected", "worse", "too_early"]),
        notes: z.string().optional(),
        wrongAssumption: z.string().optional(),
        mostUsefulBrainId: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("decision_reviews").insert({
      decision_id: data.decisionId,
      user_id: context.userId,
      outcome: data.outcome,
      notes: data.notes ?? null,
      wrong_assumption: data.wrongAssumption ?? null,
      most_useful_brain_id: data.mostUsefulBrainId ?? null,
    });
    if (error) throw new Error(error.message);
    const outcomeMap = {
      better: "good",
      as_expected: "good",
      worse: "bad",
      too_early: "unknown",
    } as const;
    await context.supabase
      .from("decisions")
      .update({ outcome: outcomeMap[data.outcome], outcome_notes: data.notes ?? null, review_at: null })
      .eq("id", data.decisionId);
    return { ok: true };
  });

export const getSharedDecisionFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(4) }).parse(d))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: row, error } = await supabase
      .from("decisions")
      .select("title,problem,context,selected_brain_ids,board,user_decision,share_mode,created_at")
      .eq("share_slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || row.share_mode === "private") return null;
    const shaped = { ...row } as Record<string, unknown>;
    if (row.share_mode !== "full") shaped["context"] = {};
    if (row.share_mode === "board") shaped["problem"] = row.title;
    return shaped as {
      title: string;
      problem: string;
      selected_brain_ids: string[];
      board: DecisionBoard | null;
      user_decision: string | null;
      created_at: string;
    };
  });
