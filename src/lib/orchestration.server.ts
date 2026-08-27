import { z } from "zod";

import { BASE_PROMPT, generateStructured } from "./ai.server";
import { BRAINS, ROUNDTABLES, getBrain, getBrains, type Brain } from "./brains";
import type {
  BrainPosition,
  DebateMessage,
  DecisionBoard,
  DecisionContext,
  InterrogationItem,
  UpdatedPosition,
} from "./decision-types";

const stanceEnum = z.enum(["strong_yes", "yes", "conditional", "no", "strong_no"]);

function brainCard(b: Brain) {
  return `You are ${b.name}. ${b.tagline}
Worldview: ${b.description}
You optimize for: ${b.optimizesFor}
Priorities: ${b.priorities.join("; ")}
Beliefs: ${b.beliefs.join(" ")}
Decision rules: ${b.decisionRules.join(" ")}
Questions you always ask: ${b.characteristicQuestions.join(" ")}
Your known blind spots (be aware of them): ${b.blindSpots.join(" ")}
You change your mind when: ${b.changeMindConditions.join(" ")}
Risk tolerance ${b.stats.riskTolerance}/100, caution ${b.stats.caution}/100, action orientation ${b.stats.actionOrientation}/100, evidence orientation ${b.stats.evidenceOrientation}/100, empathy ${b.stats.empathy}/100. Time horizon: ${b.timeHorizon}.`;
}

function contextBlock(problem: string, context: DecisionContext, interrogation: InterrogationItem[]) {
  const ctx = Object.entries(context)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
  const answered = interrogation
    .filter((i) => i.answer && i.answer.trim())
    .map((i) => `- ${getBrain(i.brainId)?.name ?? "A brain"} asked: ${i.question}\n  Answer: ${i.answer}`)
    .join("\n");
  return `THE DECISION:
${problem}

CONTEXT PROVIDED:
${ctx || "(none given)"}

ANSWERS TO THE TABLE'S QUESTIONS:
${answered || "(the user skipped the questions)"}`;
}

/* ---------------------------------- setup --------------------------------- */

const setupSchema = z.object({
  title: z.string().min(2).max(80),
  category: z.string(),
  roundtableId: z.string(),
  brainIds: z.array(z.string()).min(3).max(5),
  reason: z.string(),
  safetyNote: z.string().nullable().optional(),
});

export async function recommendSetup(problem: string) {
  const catalog = BRAINS.map((b) => `${b.id} — ${b.name}: ${b.optimizesFor}`).join("\n");
  const councils = ROUNDTABLES.map((r) => `${r.id} — ${r.name}: ${r.brainIds.join(", ")}`).join("\n");

  const result = await generateStructured(
    setupSchema,
    `${BASE_PROMPT}

You are the host of the roundtable. Given a decision, pick the five thinking styles that will disagree most usefully about it — not the five that agree with the user.
Available brains:
${catalog}

Prebuilt councils:
${councils}

If the decision touches medical treatment, self-harm, illegal activity, serious legal exposure, or a financial action that could be ruinous, write a short calm safetyNote encouraging qualified professional support alongside the roundtable. Otherwise safetyNote must be null.

Return JSON: {"title": short title in under 8 words, "category": one of Business/Career/Money/Relationships/Creativity/Leadership/Productivity/Life, "roundtableId": closest council id, "brainIds": [5 brain ids], "reason": one sentence on why this table, "safetyNote": string or null}`,
    `Decision: ${problem}`,
  );

  const valid = result.brainIds.filter((id) => getBrain(id));
  return {
    ...result,
    brainIds: valid.length >= 3 ? valid.slice(0, 5) : ROUNDTABLES[0]!.brainIds,
    safetyNote: result.safetyNote ?? undefined,
  };
}

/* ------------------------------ interrogation ----------------------------- */

const questionsSchema = z.object({
  questions: z.array(z.object({ brainId: z.string(), question: z.string().min(5) })).min(1),
});

export async function generateQuestions(
  problem: string,
  context: DecisionContext,
  brainIds: string[],
): Promise<InterrogationItem[]> {
  const brains = getBrains(brainIds);
  const result = await generateStructured(
    questionsSchema,
    `${BASE_PROMPT}

You write the interrogation round. Each brain asks exactly ONE question before the debate — the single question whose answer would most change that brain's recommendation.
Hard rules: no two questions may seek the same information. No question may ask something already answered in the context. Each question must sound like the brain that asks it. One sentence each, no preamble.

The brains at this table:
${brains.map(brainCard).join("\n\n")}

Return JSON: {"questions": [{"brainId": "...", "question": "..."}]} — one entry per brain, in the order given.`,
    contextBlock(problem, context, []),
  );

  // The model sometimes returns ids that don't match the catalog exactly; fall back
  // to positional mapping so every seated brain always gets a question.
  const byId = new Map<string, string>();
  result.questions.forEach((q, i) => {
    const id = brainIds.includes(q.brainId) ? q.brainId : brainIds[i];
    if (id && !byId.has(id)) byId.set(id, q.question);
  });

  return brainIds
    .filter((id) => byId.has(id))
    .map((id) => ({ brainId: id, question: byId.get(id)! }));
}


/* --------------------------- round 1: positions --------------------------- */

const positionSchema = z.object({
  stance: stanceEnum,
  recommendation: z.string().min(3).max(220),
  reasoning: z.array(z.string()).min(2).max(4),
  assumptions: z.array(z.string()).min(1).max(4),
  biggestConcern: z.string().min(3),
  confidence: z.number().min(0).max(100),
});

export async function generatePositions(
  problem: string,
  context: DecisionContext,
  brainIds: string[],
  interrogation: InterrogationItem[],
): Promise<BrainPosition[]> {
  const brains = getBrains(brainIds);
  const results = await Promise.all(
    brains.map(async (b) => {
      const p = await generateStructured(
        positionSchema,
        `${BASE_PROMPT}

${brainCard(b)}

This is round one. You have not heard the others. Give your independent position.
"recommendation" is one short imperative sentence — the actual action you advise, not a hedge.
"stance" answers: do you support the course of action the user is leaning toward? Use "conditional" when you support it only under a named condition.
"confidence" is your own calibrated confidence, 0-100.

Return JSON: {"stance": ..., "recommendation": "...", "reasoning": ["..."], "assumptions": ["..."], "biggestConcern": "...", "confidence": 0-100}`,
        contextBlock(problem, context, interrogation),
      );
      return { brainId: b.id, ...p } satisfies BrainPosition;
    }),
  );
  return results;
}

/* ------------------------ round 2: cross examination ---------------------- */

const challengeSchema = z.object({
  exchanges: z
    .array(
      z.object({
        fromBrainId: z.string(),
        toBrainId: z.string(),
        disagreementType: z.string(),
        challenge: z.string().min(10),
        response: z.string().min(10),
      }),
    )
    .min(2),
});

function positionsBlock(positions: BrainPosition[]) {
  return positions
    .map(
      (p) =>
        `${getBrain(p.brainId)?.name}: [${p.stance}] ${p.recommendation}\n  Because: ${p.reasoning.join(" ")}\n  Assuming: ${p.assumptions.join("; ")}\n  Worried about: ${p.biggestConcern} (confidence ${p.confidence})`,
    )
    .join("\n\n");
}

export async function generateCrossExamination(
  problem: string,
  context: DecisionContext,
  brainIds: string[],
  interrogation: InterrogationItem[],
  positions: BrainPosition[],
): Promise<DebateMessage[]> {
  const brains = getBrains(brainIds);
  const result = await generateStructured(
    challengeSchema,
    `${BASE_PROMPT}

You run the cross-examination. First, silently find the real disagreements between the positions below. A real disagreement has a root cause of exactly one of: different assumptions, different risk tolerance, different time horizon, different probability estimate, different values, different opportunity cost, different definition of success.
Then write 3 or 4 exchanges covering the most decision-relevant disagreements. Never manufacture conflict where the positions actually agree. Challenge arguments, never the other brain.
Each exchange: one brain challenges another in 1-2 sentences, and the challenged brain replies in 1-2 sentences — conceding where the point lands, holding where it does not.

The brains:
${brains.map((b) => `${b.name} (${b.id}) — optimizes for ${b.optimizesFor}`).join("\n")}

Return JSON: {"exchanges": [{"fromBrainId": "...", "toBrainId": "...", "disagreementType": "one of the seven root causes", "challenge": "...", "response": "..."}]}`,
    `${contextBlock(problem, context, interrogation)}

ROUND ONE POSITIONS:
${positionsBlock(positions)}`,
  );

  return result.exchanges.filter(
    (e) => brainIds.includes(e.fromBrainId) && brainIds.includes(e.toBrainId) && e.fromBrainId !== e.toBrainId,
  );
}

/* ------------------------- round 3: final positions ----------------------- */

const updateSchema = positionSchema.extend({
  changedMind: z.boolean(),
  changeSummary: z.string().nullable().optional(),
});

export async function generateFinalPositions(
  problem: string,
  context: DecisionContext,
  brainIds: string[],
  interrogation: InterrogationItem[],
  positions: BrainPosition[],
  debate: DebateMessage[],
): Promise<UpdatedPosition[]> {
  const brains = getBrains(brainIds);
  const debateBlock = debate
    .map(
      (d) =>
        `${getBrain(d.fromBrainId)?.name} → ${getBrain(d.toBrainId)?.name} (${d.disagreementType}): ${d.challenge}\n  ${getBrain(d.toBrainId)?.name}: ${d.response}`,
    )
    .join("\n\n");

  return Promise.all(
    brains.map(async (b) => {
      const prior = positions.find((p) => p.brainId === b.id);
      const p = await generateStructured(
        updateSchema,
        `${BASE_PROMPT}

${brainCard(b)}

You have now heard the table. Give your final position. Do not change your mind to be agreeable, and do not dig in to be consistent — move only where an argument actually landed.
If your recommendation, stance, or confidence changed meaningfully, set changedMind true and write changeSummary as one sentence starting with what moved you. Otherwise changedMind is false and changeSummary is null.

Return JSON: {"stance": ..., "recommendation": "...", "reasoning": ["..."], "assumptions": ["..."], "biggestConcern": "...", "confidence": 0-100, "changedMind": true|false, "changeSummary": string or null}`,
        `${contextBlock(problem, context, interrogation)}

YOUR ROUND ONE POSITION:
${prior ? `[${prior.stance}] ${prior.recommendation} (confidence ${prior.confidence})` : "(none)"}

ALL ROUND ONE POSITIONS:
${positionsBlock(positions)}

CROSS-EXAMINATION:
${debateBlock || "(none)"}`,
      );
      return {
        brainId: b.id,
        ...p,
        changedMind: p.changedMind,
        changeSummary: p.changeSummary ?? undefined,
      } satisfies UpdatedPosition;
    }),
  );
}

/* ----------------------------- decision board ----------------------------- */

const boardSchema = z.object({
  headlineRecommendation: z.string().min(5),
  vote: z.array(z.object({ option: z.string(), count: z.number(), brainIds: z.array(z.string()) })).min(1),
  confidence: z.number().min(0).max(100),
  agreements: z.array(z.string()).min(1),
  disagreements: z
    .array(z.object({ issue: z.string(), explanation: z.string(), brainIds: z.array(z.string()) }))
    .min(1),
  assumptions: z
    .array(
      z.object({
        statement: z.string(),
        importance: z.number().min(0).max(100),
        currentConfidence: z.number().min(0).max(100),
        supportedByBrainIds: z.array(z.string()),
        challengedByBrainIds: z.array(z.string()),
        evidenceNeeded: z.string(),
        testSuggestion: z.string().nullable().optional(),
      }),
    )
    .min(1),
  strongestArgumentFor: z.string(),
  strongestArgumentAgainst: z.string(),
  minorityOpinion: z
    .object({ brainId: z.string(), argument: z.string() })
    .nullable()
    .optional(),
  leastReversibleMistake: z.string(),
  smallestNextAction: z.string(),
  whatWouldChangeDecision: z.array(z.string()).min(1),
});

export async function generateBoard(
  problem: string,
  context: DecisionContext,
  brainIds: string[],
  interrogation: InterrogationItem[],
  positions: BrainPosition[],
  debate: DebateMessage[],
  finalPositions: UpdatedPosition[],
): Promise<DecisionBoard> {
  const result = await generateStructured(
    boardSchema,
    `${BASE_PROMPT}

You are the clerk of the roundtable. Synthesise the Decision Board. You do not add opinions of your own; you report what the table concluded and why they differ.

Requirements:
- headlineRecommendation: the most supported course of action, as one concrete imperative sentence.
- vote: group the FINAL positions into 2-4 distinct named options (short labels like "Test first", "Commit now", "Wait"). Every brain appears in exactly one group and counts must match brainIds length.
- confidence: how strongly the table converges, 0-100.
- disagreements: for each, explain the ROOT CAUSE — e.g. "they disagree because X treats this as reversible while Y assumes a three-month commitment". This explanation is the most valuable part of the board.
- assumptions: 3-5, ranked by importance, each with what evidence would resolve it and a concrete small test.
- smallestNextAction: something doable this week.
- minorityOpinion: the strongest dissent worth preserving, or null if there is none.

Return JSON matching: {"headlineRecommendation":"...","vote":[{"option":"...","count":n,"brainIds":[...]}],"confidence":n,"agreements":["..."],"disagreements":[{"issue":"...","explanation":"...","brainIds":[...]}],"assumptions":[{"statement":"...","importance":n,"currentConfidence":n,"supportedByBrainIds":[...],"challengedByBrainIds":[...],"evidenceNeeded":"...","testSuggestion":"..."}],"strongestArgumentFor":"...","strongestArgumentAgainst":"...","minorityOpinion":{"brainId":"...","argument":"..."} or null,"leastReversibleMistake":"...","smallestNextAction":"...","whatWouldChangeDecision":["..."]}`,
    `${contextBlock(problem, context, interrogation)}

ROUND ONE POSITIONS:
${positionsBlock(positions)}

CROSS-EXAMINATION:
${debate.map((d) => `${getBrain(d.fromBrainId)?.name} → ${getBrain(d.toBrainId)?.name} (${d.disagreementType}): ${d.challenge} | reply: ${d.response}`).join("\n") || "(none)"}

FINAL POSITIONS:
${positionsBlock(finalPositions)}
${finalPositions
  .filter((p) => p.changedMind)
  .map((p) => `${getBrain(p.brainId)?.name} changed their mind: ${p.changeSummary ?? ""}`)
  .join("\n")}`,
  );

  return {
    ...result,
    assumptions: result.assumptions
      .sort((a, b) => b.importance - a.importance)
      .map((a, i) => ({
        id: `a${i + 1}`,
        ...a,
        testSuggestion: a.testSuggestion ?? undefined,
      })),
    minorityOpinion: result.minorityOpinion ?? undefined,
  };
}

/* --------------------------- assumption testing --------------------------- */

const testSchema = z.object({
  title: z.string(),
  steps: z.array(z.string()).min(2).max(5),
  timeframe: z.string(),
  successSignal: z.string(),
  failureSignal: z.string(),
});
export type AssumptionTest = z.infer<typeof testSchema>;

export async function generateAssumptionTest(
  problem: string,
  assumption: string,
  evidenceNeeded: string,
): Promise<AssumptionTest> {
  return generateStructured(
    testSchema,
    `${BASE_PROMPT}

Design the smallest real-world experiment that would resolve one assumption behind a decision. It must be doable by one person, cheap, and finish fast. Concrete actions only — a specific message to send, a page to publish, a number to look up, a conversation to have.

Return JSON: {"title":"...","steps":["..."],"timeframe":"...","successSignal":"...","failureSignal":"..."}`,
    `Decision: ${problem}
Assumption to test: ${assumption}
Evidence needed: ${evidenceNeeded}`,
  );
}
