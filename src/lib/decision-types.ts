export type Stance = "strong_yes" | "yes" | "conditional" | "no" | "strong_no";

export const STANCE_LABEL: Record<Stance, string> = {
  strong_yes: "Strong yes",
  yes: "Yes",
  conditional: "Conditional",
  no: "No",
  strong_no: "Strong no",
};

export type DecisionContext = {
  background?: string;
  constraints?: string;
  desiredOutcome?: string;
  deadline?: string;
  moneyInvolved?: string;
  peopleInvolved?: string;
  alternatives?: string;
};

export type InterrogationItem = {
  brainId: string;
  question: string;
  answer?: string | undefined;
};

export type BrainPosition = {
  brainId: string;
  stance: Stance;
  recommendation: string;
  reasoning: string[];
  assumptions: string[];
  biggestConcern: string;
  confidence: number;
};

export type DebateMessage = {
  fromBrainId: string;
  toBrainId: string;
  disagreementType: string;
  challenge: string;
  response: string;
};

export type UpdatedPosition = BrainPosition & {
  changedMind: boolean;
  changeSummary?: string | undefined;
};

export type DecisionAssumption = {
  id: string;
  statement: string;
  importance: number;
  currentConfidence: number;
  supportedByBrainIds: string[];
  challengedByBrainIds: string[];
  evidenceNeeded: string;
  testSuggestion?: string | undefined;
};

export type DecisionBoard = {
  headlineRecommendation: string;
  vote: { option: string; count: number; brainIds: string[] }[];
  confidence: number;
  agreements: string[];
  disagreements: { issue: string; explanation: string; brainIds: string[] }[];
  assumptions: DecisionAssumption[];
  strongestArgumentFor: string;
  strongestArgumentAgainst: string;
  minorityOpinion?: { brainId: string; argument: string } | undefined;
  leastReversibleMistake: string;
  smallestNextAction: string;
  whatWouldChangeDecision: string[];
};

export type DecisionSession = {
  id: string;
  title: string;
  problem: string;
  context: DecisionContext;
  selectedBrainIds: string[];
  interrogation: InterrogationItem[];
  initialPositions: BrainPosition[];
  debateMessages: DebateMessage[];
  finalPositions: UpdatedPosition[];
  board?: DecisionBoard | undefined;
  safetyNote?: string | undefined;
  userDecision?: string | undefined;
  userConfidence?: number | undefined;
  savedId?: string | undefined;
  createdAt: string;
};

export const SHARE_MODES = ["private", "board", "no_context", "full"] as const;
export type ShareMode = (typeof SHARE_MODES)[number];
