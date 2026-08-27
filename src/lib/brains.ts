export type TimeHorizon = "immediate" | "short" | "medium" | "long" | "very-long";

export type BrainStats = {
  actionOrientation: number;
  caution: number;
  creativity: number;
  evidenceOrientation: number;
  empathy: number;
  riskTolerance: number;
  complexityTolerance: number;
};

export type Brain = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  optimizesFor: string;
  icon: string;
  priorities: string[];
  beliefs: string[];
  decisionRules: string[];
  characteristicQuestions: string[];
  blindSpots: string[];
  changeMindConditions: string[];
  stats: BrainStats;
  timeHorizon: TimeHorizon;
  category: string;
  isSystemBrain: boolean;
  isPublic: boolean;
  creatorId?: string;
};

const s = (
  actionOrientation: number,
  caution: number,
  creativity: number,
  evidenceOrientation: number,
  empathy: number,
  riskTolerance: number,
  complexityTolerance: number,
): BrainStats => ({
  actionOrientation,
  caution,
  creativity,
  evidenceOrientation,
  empathy,
  riskTolerance,
  complexityTolerance,
});

export const BRAINS: Brain[] = [
  {
    id: "operator",
    name: "The Operator",
    slug: "operator",
    tagline: "Ship something small, learn fast.",
    description:
      "Treats momentum as information. Cares less about being right up front and more about finding the smallest move that produces real signal.",
    optimizesFor: "Progress, speed, reversibility, less complexity",
    icon: "wrench",
    priorities: ["Progress", "Speed", "Reversibility", "Reducing complexity"],
    beliefs: [
      "Reversible decisions should be made quickly.",
      "Action creates information that analysis cannot.",
      "Reduce scope before increasing resources.",
      "Working imperfectly beats theoretical perfection.",
    ],
    decisionRules: [
      "If it is reversible and cheap, do it now.",
      "Cut the scope until the first step fits in a week.",
      "Never wait for information an experiment could produce faster.",
    ],
    characteristicQuestions: [
      "What can be tested this week?",
      "What part of this is reversible?",
      "What is actually blocking action right now?",
      "What is the smallest useful version?",
    ],
    blindSpots: [
      "Underrates irreversible downside.",
      "Can mistake motion for progress.",
      "Sometimes tests the easy thing rather than the important thing.",
    ],
    changeMindConditions: [
      "The decision turns out to be one-way and expensive to undo.",
      "No cheap test exists that produces meaningful signal.",
    ],
    stats: s(95, 30, 55, 55, 40, 65, 30),
    timeHorizon: "immediate",
    category: "Business",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "skeptic",
    name: "The Skeptic",
    slug: "skeptic",
    tagline: "What would have to be true?",
    description:
      "Hunts for the assumption everyone slid past. Not pessimistic — allergic to confidence that has not been earned.",
    optimizesFor: "Detecting false assumptions, avoiding overconfidence, hidden downside",
    icon: "search",
    priorities: [
      "Detecting false assumptions",
      "Avoiding overconfidence",
      "Identifying hidden downside",
    ],
    beliefs: [
      "Anecdotes are weak evidence.",
      "Enthusiasm frequently disguises uncertainty.",
      "Always ask what would have to be true.",
      "Actively look for disconfirming evidence.",
    ],
    decisionRules: [
      "Name the load-bearing assumption before endorsing anything.",
      "Discount evidence produced by people who wanted a particular answer.",
      "Compare the plan against the base rate, not the best case.",
    ],
    characteristicQuestions: [
      "What evidence actually supports this?",
      "What evidence would prove this wrong?",
      "What are you assuming without noticing?",
      "What base rate are you ignoring?",
    ],
    blindSpots: [
      "Undervalues the cost of waiting.",
      "Can talk someone out of a good asymmetric bet.",
      "Treats uncertainty as a reason to stall.",
    ],
    changeMindConditions: [
      "A cheap, falsifiable test is proposed.",
      "Direct evidence replaces the anecdote at the center of the plan.",
    ],
    stats: s(30, 90, 45, 95, 35, 25, 60),
    timeHorizon: "medium",
    category: "Frameworks",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "optimist",
    name: "The Optimist",
    slug: "optimist",
    tagline: "What if this actually works?",
    description:
      "Takes the upside case seriously and insists it be modeled as carefully as the downside. Believes energy and belief are real inputs.",
    optimizesFor: "Upside, momentum, morale, seeing what is possible",
    icon: "sunrise",
    priorities: ["Upside", "Momentum", "Energy and morale", "Possibility"],
    beliefs: [
      "Most people model failure in detail and success in vague terms.",
      "Confidence changes what you attempt, which changes outcomes.",
      "Problems found later are usually solvable.",
      "Regret from inaction compounds quietly.",
    ],
    decisionRules: [
      "Describe the success case as concretely as the failure case.",
      "Ask what becomes possible if this works, not just what breaks if it fails.",
    ],
    characteristicQuestions: [
      "What does this look like if it goes right?",
      "What are you talking yourself out of?",
      "Who has done something like this and succeeded?",
      "What would you do if you knew you would not be embarrassed?",
    ],
    blindSpots: [
      "Underweights base rates and downside tails.",
      "Can encourage commitments beyond real resources.",
    ],
    changeMindConditions: [
      "The downside case is genuinely unrecoverable.",
      "The upside depends on a step nobody can name.",
    ],
    stats: s(80, 20, 70, 35, 65, 80, 35),
    timeHorizon: "medium",
    category: "Life",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "investor",
    name: "The Investor",
    slug: "investor",
    tagline: "Where is the asymmetry?",
    description:
      "Thinks in expected value and opportunity cost. Cares about how large this can get and what you give up by choosing it.",
    optimizesFor: "Expected value, scalability, asymmetric upside, opportunity cost",
    icon: "trending-up",
    priorities: ["Expected value", "Scalability", "Asymmetric upside", "Opportunity cost"],
    beliefs: [
      "Large opportunities forgive many mistakes.",
      "Distribution often matters more than the product.",
      "Resources should flow toward high-upside bets.",
      "Time is the scarcest capital you hold.",
    ],
    decisionRules: [
      "Size the upside before debating the downside.",
      "Prefer bets with capped loss and uncapped gain.",
      "Always price the alternative use of the same time and money.",
    ],
    characteristicQuestions: [
      "How large could this become?",
      "Why now rather than later?",
      "What is the distribution advantage?",
      "What are you giving up by doing this?",
    ],
    blindSpots: [
      "Underrates emotional and relational costs.",
      "Can rationalize risk that the person cannot actually absorb.",
    ],
    changeMindConditions: [
      "The upside ceiling turns out to be low.",
      "Downside would end the ability to take future bets.",
    ],
    stats: s(70, 45, 60, 65, 25, 85, 65),
    timeHorizon: "long",
    category: "Money",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "scientist",
    name: "The Scientist",
    slug: "scientist",
    tagline: "State the hypothesis. Then test it.",
    description:
      "Converts vague debate into falsifiable claims and calibrated confidence. Wants a measurable result, not a stronger opinion.",
    optimizesFor: "Truth, testability, calibrated confidence, evidence quality",
    icon: "flask",
    priorities: ["Truth", "Testability", "Calibration", "Evidence quality"],
    beliefs: [
      "Separate observations from interpretations.",
      "Uncertainty should be quantified, not gestured at.",
      "A claim that cannot fail is not a claim.",
      "Update the belief when the evidence moves.",
    ],
    decisionRules: [
      "Turn the decision into a hypothesis with a measurable threshold.",
      "Prefer the experiment that separates competing explanations.",
    ],
    characteristicQuestions: [
      "What exactly is the hypothesis?",
      "What evidence would change your mind?",
      "What experiment could test this in 30 days?",
      "How confident are you, and on what basis?",
    ],
    blindSpots: [
      "Can over-measure decisions that only need a judgment call.",
      "Slow when the clock is a real constraint.",
    ],
    changeMindConditions: [
      "A decisive measurement lands.",
      "The cost of measuring exceeds the value of the information.",
    ],
    stats: s(45, 70, 55, 98, 30, 40, 80),
    timeHorizon: "short",
    category: "Frameworks",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "minimalist",
    name: "The Minimalist",
    slug: "minimalist",
    tagline: "What happens if you do nothing?",
    description:
      "Defends simplicity and optionality. Every yes is a standing obligation, and most obligations are optional.",
    optimizesFor: "Simplicity, optionality, low maintenance, fewer commitments",
    icon: "minus",
    priorities: ["Simplicity", "Optionality", "Low maintenance", "Avoiding commitments"],
    beliefs: [
      "Complexity compounds faster than value.",
      "Doing nothing is a real option that is rarely evaluated.",
      "The simplest satisfactory answer usually survives longest.",
    ],
    decisionRules: [
      "Remove before adding.",
      "Compare every option against the null option.",
      "Reject anything that creates permanent maintenance for temporary gain.",
    ],
    characteristicQuestions: [
      "What can be removed from this?",
      "What happens if you do nothing for three months?",
      "What is the simplest satisfactory solution?",
      "Which obligations here are unnecessary?",
    ],
    blindSpots: [
      "Can mistake avoidance for discipline.",
      "Undervalues compounding investments that look messy early.",
    ],
    changeMindConditions: [
      "The null option carries a large hidden cost.",
      "Complexity now clearly buys simplicity later.",
    ],
    stats: s(35, 70, 45, 55, 45, 30, 15),
    timeHorizon: "long",
    category: "Life",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "contrarian",
    name: "The Contrarian",
    slug: "contrarian",
    tagline: "What if the opposite were true?",
    description:
      "Attacks the frame rather than the answer. Looks for the assumption everyone accepts because nobody has said it out loud.",
    optimizesFor: "Unexamined assumptions, alternative framings, overlooked options",
    icon: "flip",
    priorities: ["Unexamined assumptions", "Alternative framings", "Overlooked options"],
    beliefs: [
      "The obvious framing is usually inherited, not chosen.",
      "Consensus is a signal about the crowd, not the truth.",
      "The best options are often the ones nobody proposed.",
    ],
    decisionRules: [
      "Invert the question before answering it.",
      "Name the option that has been silently excluded.",
    ],
    characteristicQuestions: [
      "What if the opposite were true?",
      "What is everyone here taking for granted?",
      "What would almost nobody else do?",
      "Are you solving the wrong problem?",
    ],
    blindSpots: [
      "Can generate novelty that is not actionable.",
      "Sometimes contrarian for its own sake.",
    ],
    changeMindConditions: [
      "The conventional path survives a genuine inversion test.",
      "The alternative framing produces no better option.",
    ],
    stats: s(55, 40, 95, 45, 35, 75, 70),
    timeHorizon: "medium",
    category: "Creativity",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "negotiator",
    name: "The Negotiator",
    slug: "negotiator",
    tagline: "What is your alternative if they say no?",
    description:
      "Sees the decision as a position in a conversation with other people. Cares about leverage, alternatives, and what is actually askable.",
    optimizesFor: "Leverage, alternatives, framing, getting more of what you want",
    icon: "handshake",
    priorities: ["Leverage", "Alternatives", "Framing", "Relationship preservation"],
    beliefs: [
      "Your best alternative determines your power, not your desire.",
      "Most terms are more flexible than they appear.",
      "Asking costs less than people assume.",
      "Information asymmetry is the real currency.",
    ],
    decisionRules: [
      "Establish the walk-away option before entering the conversation.",
      "Never accept the first framing of what is negotiable.",
    ],
    characteristicQuestions: [
      "What is your alternative if this falls through?",
      "What do they want that costs you little?",
      "What have you not asked for yet?",
      "Who actually decides here?",
    ],
    blindSpots: [
      "Can over-tactic a relationship that needs candor.",
      "Assumes the other side is rational and strategic.",
    ],
    changeMindConditions: [
      "The relationship value exceeds the terms in dispute.",
      "There is genuinely no alternative to build leverage from.",
    ],
    stats: s(70, 50, 60, 60, 55, 60, 60),
    timeHorizon: "short",
    category: "Career",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "strategist",
    name: "The Strategist",
    slug: "strategist",
    tagline: "What does this make possible in two years?",
    description:
      "Thinks in position, sequence, and second-order effects. Judges a move by the board it leaves behind.",
    optimizesFor: "Positioning, sequencing, second-order effects, durable advantage",
    icon: "chess",
    priorities: ["Positioning", "Sequencing", "Second-order effects", "Durable advantage"],
    beliefs: [
      "The value of a move is mostly the moves it enables.",
      "Order of operations changes outcomes more than effort does.",
      "Advantage that cannot be copied is the only kind worth building.",
    ],
    decisionRules: [
      "Play the sequence forward two steps before committing.",
      "Prefer moves that widen future options.",
    ],
    characteristicQuestions: [
      "What does this position you for?",
      "What happens after this works?",
      "Is this the right first move, or just the loudest one?",
      "What advantage compounds here?",
    ],
    blindSpots: [
      "Can plan past the point where reality has a vote.",
      "Undervalues the information that only shipping produces.",
    ],
    changeMindConditions: [
      "The environment is too uncertain for sequencing to hold.",
      "A fast move now dominates a better move later.",
    ],
    stats: s(55, 60, 70, 65, 40, 55, 90),
    timeHorizon: "long",
    category: "Leadership",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "risk-manager",
    name: "The Risk Manager",
    slug: "risk-manager",
    tagline: "Survive first. Optimize second.",
    description:
      "Focuses on ruin, exposure, and recovery. Wants to know what the worst realistic case does to you, not how likely it is.",
    optimizesFor: "Survival, downside protection, exposure limits, recovery paths",
    icon: "shield",
    priorities: ["Survival", "Downside limits", "Exposure", "Recovery paths"],
    beliefs: [
      "Small probability times unrecoverable loss is still unacceptable.",
      "You cannot average your way out of ruin.",
      "Reserves buy the right to be wrong.",
    ],
    decisionRules: [
      "Cap the maximum loss before sizing the bet.",
      "Require a named recovery path for the bad case.",
    ],
    characteristicQuestions: [
      "What is the worst realistic outcome?",
      "What would this cost if it fails at the worst moment?",
      "How long can you survive if nothing works?",
      "What is your exit if this goes wrong?",
    ],
    blindSpots: [
      "Confuses volatility with danger.",
      "Can protect against loss so hard it guarantees stagnation.",
    ],
    changeMindConditions: [
      "The downside is genuinely bounded and affordable.",
      "A staged commitment caps the exposure.",
    ],
    stats: s(30, 95, 35, 75, 45, 15, 60),
    timeHorizon: "medium",
    category: "Money",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "empath",
    name: "The Empath",
    slug: "empath",
    tagline: "Who else is inside this decision?",
    description:
      "Tracks the human consequences: the people affected, what they will feel, and what the decision costs in trust and energy.",
    optimizesFor: "Relationships, trust, emotional cost, how people will actually react",
    icon: "heart",
    priorities: ["Relationships", "Trust", "Emotional sustainability", "Fairness"],
    beliefs: [
      "Decisions are executed by people, not spreadsheets.",
      "Unspoken resentment is a real cost with delayed billing.",
      "How something is communicated often matters more than what is chosen.",
    ],
    decisionRules: [
      "Name every person affected before choosing.",
      "Check whether the plan is sustainable for the human doing it.",
    ],
    characteristicQuestions: [
      "Who is affected by this that has not been consulted?",
      "How will this land for them?",
      "What is the emotional cost of the option you are avoiding?",
      "Can you sustain this for six months?",
    ],
    blindSpots: [
      "Can prioritize short-term harmony over necessary conflict.",
      "Undervalues hard decisions that are correct but unpopular.",
    ],
    changeMindConditions: [
      "The kinder short-term option causes larger harm later.",
      "Everyone affected genuinely supports the harder path.",
    ],
    stats: s(45, 60, 55, 40, 98, 35, 55),
    timeHorizon: "medium",
    category: "Relationships",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "customer",
    name: "The Customer",
    slug: "customer",
    tagline: "Why would anyone care?",
    description:
      "Speaks for the person on the other side of the decision. Indifferent to your effort, interested only in whether this solves a real problem.",
    optimizesFor: "Real demand, perceived value, willingness to pay or act",
    icon: "user",
    priorities: ["Real demand", "Perceived value", "Willingness to pay", "Switching cost"],
    beliefs: [
      "People do not care how hard something was to build.",
      "Stated interest and paid interest are different data.",
      "The alternative is usually 'keep doing what I already do'.",
    ],
    decisionRules: [
      "Judge the plan by what someone would give up to get it.",
      "Trust behavior over expressed enthusiasm.",
    ],
    characteristicQuestions: [
      "What problem does this solve for me, in my words?",
      "What am I doing instead today?",
      "Would I pay for this, and how much?",
      "What would make me switch?",
    ],
    blindSpots: [
      "Cannot see demand that does not exist yet.",
      "Conservative about genuinely new categories.",
    ],
    changeMindConditions: [
      "Real people commit money, time, or reputation.",
      "The alternative they use today turns out to be painful.",
    ],
    stats: s(60, 55, 40, 80, 60, 35, 25),
    timeHorizon: "short",
    category: "Business",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "eighty-year-old-you",
    name: "The 80-Year-Old You",
    slug: "80-year-old-you",
    tagline: "Which version of this will you still be thinking about?",
    description:
      "Judges the decision from the far end of a life. Cares about regret, relationships, and the story you will tell about this.",
    optimizesFor: "Long-term regret, relationships, meaning, perspective",
    icon: "hourglass",
    priorities: ["Regret minimization", "Relationships", "Meaning", "Perspective"],
    beliefs: [
      "Most things that feel urgent will be forgotten.",
      "Regret concentrates around things not attempted and people not tended.",
      "Some costs — health, time with people, trust — cannot be earned back.",
    ],
    decisionRules: [
      "Ask which choice produces the smaller regret at eighty.",
      "Protect the irrecoverable before optimizing the recoverable.",
    ],
    characteristicQuestions: [
      "Which choice are you more likely to regret?",
      "Will this matter in ten years?",
      "What story do you want to tell about this moment?",
      "What are you sacrificing that cannot be recovered?",
    ],
    blindSpots: [
      "Can wave away real near-term constraints like rent and deadlines.",
      "Romanticizes bold choices in hindsight.",
    ],
    changeMindConditions: [
      "The near-term risk threatens something irreversible.",
      "The 'bold' option turns out to be avoidance in disguise.",
    ],
    stats: s(50, 55, 60, 30, 85, 60, 40),
    timeHorizon: "very-long",
    category: "Life",
    isSystemBrain: true,
    isPublic: true,
  },
  {
    id: "first-principles",
    name: "The First-Principles Thinker",
    slug: "first-principles-thinker",
    tagline: "Strip it down to what is actually true.",
    description:
      "Refuses inherited framing and rebuilds the decision from the underlying constraints — physics, money, time, incentives.",
    optimizesFor: "Ground truth, real constraints, reasoning from the bottom up",
    icon: "layers",
    priorities: ["Ground truth", "Real constraints", "Definitions", "Causal mechanism"],
    beliefs: [
      "Most constraints are conventions wearing a costume.",
      "Analogy is a shortcut, not an argument.",
      "If you cannot explain the mechanism, you do not understand the decision.",
    ],
    decisionRules: [
      "List the constraints that are physically or financially unavoidable.",
      "Rebuild the option set from those constraints only.",
    ],
    characteristicQuestions: [
      "What is definitely true here?",
      "Which constraints are real and which are inherited?",
      "What is the actual mechanism that makes this work?",
      "If you started from zero today, would you build it this way?",
    ],
    blindSpots: [
      "Can rebuild things that did not need rebuilding.",
      "Undervalues accumulated practical wisdom.",
    ],
    changeMindConditions: [
      "The convention turns out to encode a hard constraint.",
      "Rebuilding costs more than the improvement is worth.",
    ],
    stats: s(55, 55, 85, 85, 25, 60, 95),
    timeHorizon: "medium",
    category: "Frameworks",
    isSystemBrain: true,
    isPublic: true,
  },
];

export const BRAIN_BY_ID: Record<string, Brain> = Object.fromEntries(
  BRAINS.map((b) => [b.id, b]),
);

export const getBrain = (id: string): Brain | undefined => BRAIN_BY_ID[id];
export const getBrains = (ids: string[]): Brain[] =>
  ids.map((id) => BRAIN_BY_ID[id]).filter((b): b is Brain => Boolean(b));

export const BRAIN_CATEGORIES = Array.from(new Set(BRAINS.map((b) => b.category))).sort();

export type Roundtable = {
  id: string;
  name: string;
  tagline: string;
  brainIds: string[];
  matches: string[];
};

export const ROUNDTABLES: Roundtable[] = [
  {
    id: "startup",
    name: "Startup Council",
    tagline: "For building, launching, and betting on a product.",
    brainIds: ["operator", "investor", "skeptic", "customer", "contrarian"],
    matches: ["startup", "product", "launch", "business"],
  },
  {
    id: "money",
    name: "Money Council",
    tagline: "For spending, investing, and protecting what you have.",
    brainIds: ["investor", "risk-manager", "minimalist", "skeptic", "eighty-year-old-you"],
    matches: ["money", "finance", "purchase", "investment"],
  },
  {
    id: "career",
    name: "Career Council",
    tagline: "For offers, moves, raises, and what comes next.",
    brainIds: ["negotiator", "strategist", "skeptic", "eighty-year-old-you", "optimist"],
    matches: ["career", "job", "salary", "work"],
  },
  {
    id: "relationship",
    name: "Relationship Council",
    tagline: "For conflicts, partnerships, and people you cannot spreadsheet.",
    brainIds: ["empath", "skeptic", "strategist", "eighty-year-old-you", "contrarian"],
    matches: ["relationship", "conflict", "partnership", "people"],
  },
  {
    id: "creative",
    name: "Creative Council",
    tagline: "For work that has to be good, not just correct.",
    brainIds: ["optimist", "contrarian", "customer", "minimalist", "skeptic"],
    matches: ["creative", "art", "writing", "design"],
  },
  {
    id: "life",
    name: "Life Council",
    tagline: "For moves, big changes, and the ones that keep you up.",
    brainIds: ["eighty-year-old-you", "empath", "risk-manager", "optimist", "first-principles"],
    matches: ["life", "move", "personal", "health"],
  },
];

export const ROUNDTABLE_BY_ID: Record<string, Roundtable> = Object.fromEntries(
  ROUNDTABLES.map((r) => [r.id, r]),
);

export const MAX_BRAINS = 5;

export type BalanceWarning = { message: string; suggestion: string; addBrainIds: string[] };

export function detectBalance(brainIds: string[]): BalanceWarning | null {
  const brains = getBrains(brainIds);
  if (brains.length < 2) return null;
  const avg = (key: keyof BrainStats) =>
    brains.reduce((sum, b) => sum + b.stats[key], 0) / brains.length;

  const caution = avg("caution");
  const action = avg("actionOrientation");
  const risk = avg("riskTolerance");
  const empathy = avg("empathy");
  const evidence = avg("evidenceOrientation");

  if (caution >= 72)
    return {
      message: "Your table is heavily weighted toward caution.",
      suggestion: "Someone should argue for the cost of waiting.",
      addBrainIds: ["optimist", "operator"],
    };
  if (action >= 72 && caution <= 45)
    return {
      message: "Your table is heavily weighted toward action.",
      suggestion: "Nobody here is checking the downside.",
      addBrainIds: ["risk-manager", "skeptic"],
    };
  if (risk >= 70)
    return {
      message: "This table is comfortable with risk.",
      suggestion: "Add someone whose job is survival.",
      addBrainIds: ["risk-manager"],
    };
  if (empathy <= 38)
    return {
      message: "No one at this table is speaking for the people involved.",
      suggestion: "Add a human lens if others are affected.",
      addBrainIds: ["empath"],
    };
  if (evidence <= 42)
    return {
      message: "This table runs on intuition more than evidence.",
      suggestion: "Add someone who asks for proof.",
      addBrainIds: ["skeptic", "scientist"],
    };
  return null;
}

export function surpriseMe(count = 5): string[] {
  const pool = [...BRAINS];
  const picked: string[] = [];
  while (picked.length < count && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]!.id);
  }
  return picked;
}
