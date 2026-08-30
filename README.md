# Mindful Decisions

Build a polished MVP web application called Borrowed Brain.

The core product idea is:

People do not always need another answer. They need another way of thinking.

Borrowed Brain helps a user make a decision by letting them “borrow” multiple distinct decision-making styles. Instead of asking one generic chatbot, the user gives the app a problem, chooses several “brains,” and watches them analyze and debate the decision from genuinely different worldviews.

The product should feel simple, fast, thoughtful, slightly playful, and highly shareable.

The core interaction is:

Problem → Add Context → Choose Brains → Interrogation → Roundtable Debate → Decision Board → User Decides → Save for Later Review

Do not build this as a generic multi-agent chat interface. The differentiation must come from the structure of the reasoning, the personalities of the brains, the disagreement analysis, and the decision output.

1. Product Goal

Create a consumer-facing web app where someone can enter a real decision such as:

Should I launch this product now?

Should I accept this job offer?

How should I negotiate this salary?

Should I spend $5,000 on this?

Should I end this business partnership?

Should I move to another city?

How should I handle this conflict?

Should I build this feature?

The user then chooses up to five “brains” that represent different decision-making philosophies.

Example brains:

The Skeptic

The Optimist

The Operator

The Investor

The Scientist

The Negotiator

The Minimalist

The Contrarian

The Strategist

The Empath

The Risk Manager

The Customer

The 80-Year-Old You

Surprise Me

The brains should not simply produce differently worded answers.

Each brain must have:

a worldview;

explicit priorities;

decision rules;

preferred evidence;

risk tolerance;

time horizon;

characteristic questions;

known blind spots;

conditions under which it changes its mind.

The app should then orchestrate a structured debate between those brains.

The final output should not merely be a consensus answer.

It should help the user understand:

where the brains agree;

where they disagree;

why they disagree;

what assumptions drive the disagreement;

what information would resolve the uncertainty;

what the most reversible next action is;

what each worldview recommends;

how confident the system is;

what the user ultimately decides.

2. Core Product Principles

The product must follow these principles.

A. Thinking styles are the product

The application should never feel like the same model wearing different costumes.

Every brain needs a distinct decision algorithm.

For example:

Operator

Optimizes for:

progress;

speed;

reversibility;

reducing complexity.

Beliefs:

reversible decisions should be made quickly;

action creates information;

reduce scope before increasing resources;

working imperfectly beats theoretical perfection.

Typical questions:

What can be tested this week?

What is reversible?

What is blocking action?

What is the smallest useful version?

Skeptic

Optimizes for:

detecting false assumptions;

avoiding overconfidence;

identifying hidden downside.

Beliefs:

anecdotes are weak evidence;

enthusiasm frequently disguises uncertainty;

ask what would have to be true;

look for disconfirming evidence.

Typical questions:

What evidence supports this?

What evidence would prove this wrong?

What are you assuming?

What base rate are you ignoring?

Investor

Optimizes for:

expected value;

scalability;

asymmetric upside;

opportunity cost.

Beliefs:

large markets forgive mistakes;

distribution can matter more than product;

resources should flow toward high-upside opportunities;

time has an opportunity cost.

Typical questions:

How large could this become?

Why now?

What is the distribution advantage?

What are you giving up by doing this?

Scientist

Optimizes for:

truth;

testability;

calibrated confidence;

evidence quality.

Beliefs:

distinguish observations from interpretations;

quantify uncertainty;

hypotheses should be falsifiable;

update beliefs when evidence changes.

Typical questions:

What exactly is the hypothesis?

What evidence would change your mind?

What experiment could test this?

How confident are you and why?

Minimalist

Optimizes for:

simplicity;

optionality;

low maintenance;

avoiding unnecessary commitments.

Typical questions:

What can be removed?

What happens if you do nothing?

What is the simplest satisfactory solution?

Which obligations are unnecessary?

Contrarian

Optimizes for:

uncovering assumptions everyone else accepts;

finding overlooked opportunities;

alternative framings.

Typical questions:

What if the opposite were true?

What assumption is everyone taking for granted?

What would almost nobody else do?

Are you solving the wrong problem?

80-Year-Old You

Optimizes for:

long-term regret;

relationships;

life meaning;

perspective.

Typical questions:

Which choice are you more likely to regret?

Will this matter in ten years?

What story do you want to tell about this?

What are you sacrificing that cannot be recovered?

3. Brain Schema

Represent every brain using structured data.

Each brain should include at least:

type Brain = {
  id: string
  name: string
  slug: string
  tagline: string
  description: string

  priorities: string[]
  beliefs: string[]
  decisionRules: string[]
  characteristicQuestions: string[]
  blindSpots: string[]
  changeMindConditions: string[]

  stats: {
    actionOrientation: number
    caution: number
    creativity: number
    evidenceOrientation: number
    empathy: number
    riskTolerance: number
    complexityTolerance: number
  }

  timeHorizon:
    | "immediate"
    | "short"
    | "medium"
    | "long"
    | "very-long"

  category: string

  isSystemBrain: boolean
  isPublic: boolean

  creatorId?: string
}


Stats should range from 0–100.

These stats should be visible in the UI in a lightweight way so users can understand why different brains behave differently.

4. Prebuilt Brains

Ship the MVP with approximately 12–15 high-quality default brains.

Recommended initial set:

The Operator

The Skeptic

The Optimist

The Investor

The Scientist

The Minimalist

The Contrarian

The Negotiator

The Strategist

The Risk Manager

The Empath

The Customer

The 80-Year-Old You

The First-Principles Thinker

Surprise Me

Framework-oriented brains should be encouraged.

Examples for future expansion:

Expected Value

Pre-Mortem

Inversion

Second-Order Effects

Regret Minimization

Game Theory

Jobs-to-be-Done

Devil's Advocate

Avoid fake claims that the app literally reproduces the mind of a real famous person.

Do not present generated brains as authoritative simulations of actual individuals.

5. Home Screen

The primary home screen should be extremely simple.

Large headline:

Borrow another brain.

Subheadline:

One problem. Five ways of thinking.

Primary input:

What's on your mind?

Large textarea with rotating example prompts such as:

Should I launch this product now?

Should I take this job?

Should I raise my price?

Should I move?

How should I handle this disagreement?

Primary CTA:

Think About It

Below that, optionally show:

recommended roundtables;

popular brains;

recent saved decisions for authenticated users.

Do not overwhelm the user with configuration before they have entered a problem.

6. Decision Setup Flow

After entering a problem, move into a short setup flow.

Ask:

Step 1 — What are you deciding?

Show the original problem and allow editing.

Step 2 — Give us context

Ask for optional context.

Possible structured fields:

background;

constraints;

desired outcome;

deadline;

money involved;

people involved;

alternatives already considered.

Do not require every field.

A conversational UI may ask the user only the context relevant to the problem.

Step 3 — Choose your brains

Allow users to select up to five.

Each brain card should show:

name;

tagline;

2–3 key traits;

small stat visualization;

what that brain optimizes for.

Also provide:

Recommend a Roundtable

and:

Surprise Me

7. Prebuilt Roundtables

Create reusable combinations of brains.

Examples:

Startup Council

Operator

Investor

Skeptic

Customer

Contrarian

Money Council

Investor

Risk Manager

Minimalist

Skeptic

80-Year-Old You

Career Council

Negotiator

Strategist

Skeptic

80-Year-Old You

Optimist

Relationship Council

Empath

Skeptic

Strategist

80-Year-Old You

Contrarian

Creative Council

Optimist

Contrarian

Customer

Minimalist

Skeptic

The product should suggest a council automatically based on the user's problem.

8. Balance Detection

Analyze the selected brains before the debate.

Detect whether the Roundtable is disproportionately:

cautious;

optimistic;

action-oriented;

analytical;

emotional;

short-term;

long-term;

risk-seeking;

risk-averse.

If appropriate, show a subtle warning.

Example:

Your table is heavily weighted toward caution.

Suggested action:

Add an Optimist

or:

Add an Operator

This should be optional rather than blocking.

9. Interrogation Phase

This is a critical differentiator.

Before the debate, each selected brain should generate one high-value question that reflects its worldview.

Do not ask redundant questions.

Example:

Problem:

Should I quit my job to build my startup?

Investor:

How much financial runway do you currently have?

Operator:

What could you test without quitting?

Skeptic:

What evidence do you have that customers will pay?

80-Year-Old You:

Which outcome would you regret more: trying and failing, or never trying?

Scientist:

What measurable result would convince you that quitting is justified?

Present 3–5 questions in a clean conversational flow.

The user may:

answer all;

answer some;

skip.

Feed these answers into the debate.

10. Roundtable Debate Engine

The debate should consist of structured phases.

Do not simply make five independent LLM calls and concatenate the results.

Use an orchestration layer.

Recommended phases:

Round 1 — Initial Position

Each brain independently responds with:

recommendation;

reasoning;

key assumptions;

confidence;

biggest concern.

Structured response:

type BrainPosition = {
  brainId: string
  stance: "strong_yes" | "yes" | "conditional" | "no" | "strong_no"
  recommendation: string
  reasoning: string[]
  assumptions: string[]
  biggestConcern: string
  confidence: number
}


Round 2 — Cross Examination

Each brain receives summarized positions from the other brains.

The system chooses the most meaningful disagreements.

Brains should challenge arguments rather than personalities.

Examples:

Skeptic challenges Operator's lack of evidence.

Operator challenges Skeptic's cost of waiting.

Investor challenges Minimalist's limited upside.

Scientist asks another brain what evidence would change its recommendation.

Do not produce pointless theatrical disagreement.

Cross examination should focus on decision-relevant assumptions.

Round 3 — Updated Position

Each brain sees the strongest arguments from the debate.

It may:

keep its stance;

weaken its stance;

strengthen its stance;

change its stance.

Track stance changes.

Example UI:

Skeptic changed their mind

WAIT → RUN A SMALL TEST

Show why.

11. Debate UI

The debate should feel alive but remain fast.

Recommended interface:

visual roundtable or participant row;

each brain has avatar/icon;

short message bubbles;

highlight when a brain challenges another;

show stance chips;

show changes of mind.

Do not make the user wait through long simulated typing.

The UI can reveal prepared responses quickly with brief transitions.

The goal is intellectual theater, not fake latency.

Provide controls:

Pause;

Skip to Decision Board;

Expand reasoning;

Ask this brain more.

12. Decision Board

The Decision Board is the core output.

It should be highly structured and visually clear.

Include:

Most Supported Recommendation

Example:

Launch a 7-day paid test before committing further resources.

Roundtable Vote

Example:

Launch: 2

Test First: 3

Wait: 0

Confidence

Example:

72%

Clarify that this is model-derived confidence, not statistical certainty.

Where They Agree

Example:

The opportunity is worth testing.

Current evidence is insufficient for a large commitment.

Product scope should be reduced.

Where They Disagree

Example:

Investor values speed and upside.

Skeptic values evidence and downside protection.

Operator believes the decision is reversible.

Risk Manager believes runway is the central issue.

Critical Assumptions

Rank the assumptions that most affect the decision.

Example:

At least 10 customers will pay $20.

Distribution can be tested without building the full product.

The user has enough runway for a three-month experiment.

What Would Change the Decision?

For each important assumption, explain what evidence could shift the recommendation.

Strongest Argument For

Strongest Argument Against

Least Reversible Mistake

Smallest Next Action

Example:

Create a landing page and ask 20 target users to pay before building the product.

Minority Opinion

Highlight a strong dissenting viewpoint even if the majority disagrees.

This prevents false consensus.

13. Assumption Mapping

Treat assumption extraction as a first-class feature.

Create a structured schema:

type DecisionAssumption = {
  id: string
  statement: string
  importance: number
  currentConfidence: number
  supportedByBrainIds: string[]
  challengedByBrainIds: string[]
  evidenceNeeded: string
  testSuggestion?: string
}


Present assumptions visually.

For example:

Your decision mostly depends on:

Customers will pay.

You can reach them cheaply.

The opportunity cost of waiting is high.

Allow users to click:

Test This Assumption

Generate a small experiment.

Examples:

customer interview;

pre-order page;

salary benchmark research;

budget comparison;

negotiation script;

one-week prototype;

conversation with stakeholder.

14. User Decision

After reviewing the board, ask:

What do you want to do?

Choices:

Follow the recommendation;

Choose another option;

I'm not ready to decide.

Allow freeform entry.

Example:

My decision: Launch a paid test this weekend.

Then ask optionally:

How confident are you?

0–100%.

This separates the AI recommendation from the human's actual decision.

15. Decision Memory

Authenticated users should be able to save decisions.

Store:

type Decision = {
  id: string
  userId: string

  title: string
  problem: string
  context: string

  selectedBrainIds: string[]

  interrogationAnswers: Record<string, string>

  initialPositions: BrainPosition[]
  debateMessages: DebateMessage[]
  finalPositions: BrainPosition[]

  assumptions: DecisionAssumption[]

  recommendation: string
  consensusSummary: string
  disagreementSummary: string

  userDecision?: string
  userConfidence?: number

  outcome?: "good" | "bad" | "mixed" | "unknown"
  outcomeNotes?: string

  reviewAt?: Date

  createdAt: Date
}


Show a Decisions dashboard.

Each card should display:

decision title;

date;

selected brains;

recommendation;

user's decision;

confidence;

review status.

16. Decision Review

Allow users to schedule a future review.

Example:

Review this decision in:

1 week;

1 month;

3 months;

custom.

At review time ask:

How did this turn out?

Options:

Better than expected;

About as expected;

Worse than expected;

Too early to tell.

Then:

What happened?

Which assumption turned out to be wrong?

Which brain was most useful?

Use this data later to create personal decision insights.

17. Personal Decision Insights

Create the architecture for future personalized insights, even if the MVP only shows a simple version.

Possible future insights:

You tend to favor action-oriented brains.

Your initial confidence is usually higher than your later outcome ratings justify.

The Skeptic has been most predictive in financial decisions.

The Operator has been most useful for product decisions.

Distribution assumptions are frequently wrong in your startup decisions.

Do not overstate the accuracy of these insights.

Frame them as patterns from the user's recorded decisions.

18. Custom Brains

Authenticated users should eventually be able to create custom brains.

Create a Brain Builder interface.

Ask:

What kind of thinker are you creating?

Fields:

Name

Tagline

Description

What does this brain optimize for?

What does it believe?

What questions does it always ask?

What mistakes does it avoid?

What are its blind spots?

What would make it change its mind?

Risk tolerance

Time horizon

Evidence orientation

Action orientation

Creativity

Allow AI-assisted generation from a description.

Example:

“Create a strict CFO who hates unnecessary expenses but is willing to invest aggressively where ROI is measurable.”

The system should generate the structured brain schema and let the user edit it.

19. Brain Marketplace Architecture

The MVP does not need full payments or creator payouts, but design the schema so public brains can later be shared.

Possible marketplace categories:

Business

Career

Money

Relationships

Creativity

Leadership

Productivity

Life

Frameworks

Fun

Brain cards should support:

creator;

description;

number of uses;

rating;

“Changed my thinking” score;

save/favorite;

add to Roundtable.

Do not build fake user activity.

Seed only system brains initially.

20. Shareability

Every completed Decision Board should optionally generate a shareable public page.

The user controls what is visible.

Allow options:

Share everything;

Hide original context;

Share only Decision Board;

Keep private.

Public share page should be visually attractive.

Suggested title:

Five brains debated whether I should launch my startup.

Show:

problem;

selected brains;

vote;

biggest disagreement;

critical assumption;

final recommendation.

Provide a copy-link button.

Do not expose private information by default.

21. Brain Battles / Future Social Mode

Prepare architecture for a future social feature called:

Brain Battles

A public question is debated by opposing brains.

Examples:

Bootstrap vs Raise VC

Minimalist vs Maximizer

Optimist vs Skeptic

Founder vs CFO

Users can vote:

Who made the better argument?

Also consider:

Decision of the Day

Do not make this required for MVP launch.

22. AI Orchestration

Use one capable LLM initially unless there is a strong reason to use multiple models.

Brains are conceptual reasoning agents, not necessarily separate model providers.

Build a reliable orchestration pipeline.

Recommended stages:

classify the decision;

extract relevant context;

recommend brains;

generate non-redundant interrogation questions;

produce independent initial positions;

identify disagreement clusters;

select cross-examination pairs;

generate challenges;

generate updated positions;

detect changed minds;

extract agreements;

extract disagreements;

extract assumptions;

rank assumptions;

synthesize decision board;

suggest smallest next action.

Use structured JSON outputs wherever possible.

Validate outputs using schemas.

Retry invalid generations.

Avoid relying on freeform parsing.

23. LLM Prompting Strategy

Create a shared base prompt for every brain.

The prompt should make clear:

stay faithful to the brain's worldview;

do not intentionally disagree just to be entertaining;

concede strong arguments;

change your position when warranted;

distinguish facts from assumptions;

explicitly state uncertainty;

avoid pretending to know information not provided;

prioritize useful reasoning over personality theatrics;

keep answers concise.

Inject the brain schema into this prompt.

Each phase should have its own system instructions.

Do not create one enormous prompt for the entire conversation.

24. Debate Integrity

The debate system should actively discourage fake disagreement.

Before generating challenges, identify actual differences between positions.

Possible disagreement types:

different assumptions;

different risk tolerance;

different time horizons;

different estimates of probability;

different values;

different opportunity costs;

different definitions of success.

The final synthesis should explain the root cause.

Example:

Operator and Skeptic disagree primarily because Operator considers the experiment reversible, while Skeptic assumes the commitment requires three months of full-time work.

This type of explanation is important.

25. Safety

Borrowed Brain is a decision-support product, not an authority.

For high-stakes areas such as:

medical treatment;

self-harm;

illegal activity;

major legal decisions;

highly consequential financial actions;

show appropriate caution and encourage qualified professional support when necessary.

Brains must not falsely claim professional credentials.

A brain called “Lawyer” should be framed as a legal reasoning lens unless backed by an actual professional-created profile.

Likewise, do not claim that an AI brain replaces a physician, attorney, financial adviser, therapist, or other professional.

26. Design Direction

The app should feel:

intelligent;

playful;

premium;

calm;

modern;

slightly philosophical.

Avoid:

generic enterprise dashboards;

excessive gradients;

crypto aesthetics;

childish cartoon UI;

overwhelming AI terminology.

The user should feel like they are entering a small council chamber.

Possible visual motifs:

circles;

brain avatars;

seats around a table;

cards representing worldviews;

subtle debate connections;

vote indicators.

Use generous whitespace.

Typography should be strong and readable.

Desktop and mobile must both feel intentional.

27. Brain Avatars

Use simple abstract illustrations/icons for brains rather than photorealistic human faces.

Each brain should have a visual identity.

Examples:

Operator — wrench / forward arrow
Scientist — flask / microscope
Investor — chart / coin
Skeptic — magnifying glass
Contrarian — reversed arrow
Minimalist — single line / minus
80-Year-Old You — hourglass
Strategist — chess piece
Negotiator — handshake
Empath — heart / speech bubble

Keep them visually consistent.

28. Main Navigation

Recommended navigation:

Think

Decisions

Brains

Roundtables

Profile

Eventually:

Explore

Brain Battles

Primary action should always remain:

New Decision

29. Authentication

Allow users to try at least one decision without creating an account.

After the first Decision Board, prompt:

Save this decision

Then offer authentication.

Support standard:

email magic link;

Google;

Apple if convenient.

Do not block the core aha moment behind signup.

30. Monetization Architecture

Prepare the application for three tiers.

Free

Suggested:

limited Roundtables per week;

default brains;

basic decision history;

shareable Decision Boards.

Plus

Suggested future price:

$5–$10/month.

Includes:

higher/unlimited usage;

custom brains;

advanced Roundtables;

longer debates;

decision history;

decision reviews;

personal insights;

private shared brains.

Creator

Includes:

publish brains;

marketplace analytics;

paid brains;

collections;

revenue share.

Do not implement complicated billing unless necessary for the MVP.

Build subscription fields in the user model so Stripe can be added cleanly.

31. Suggested Data Model

At minimum create entities for:

User
Brain
Roundtable
RoundtableBrain
Decision
DecisionBrain
InterrogationQuestion
InterrogationAnswer
BrainPosition
DebateMessage
DecisionAssumption
DecisionBoard
DecisionReview
SavedBrain
SharedDecision
Subscription


Use relational relationships where appropriate.

Store AI-generated structured outputs so the application does not need to regenerate the session every time the user views it.

32. Recommended API Structure

Example endpoints or server actions:

POST /decisions
POST /decisions/:id/context

POST /decisions/:id/recommend-brains

POST /decisions/:id/interrogation
POST /decisions/:id/interrogation/answers

POST /decisions/:id/debate/start
GET  /decisions/:id/debate

POST /decisions/:id/finalize

POST /decisions/:id/user-decision

POST /decisions/:id/review

GET /brains
GET /brains/:id
POST /brains

GET /roundtables
GET /roundtables/:id


The exact architecture can vary depending on the chosen stack.

33. Real-Time Debate

If convenient, stream debate events to the client.

Possible event format:

type DebateEvent =
  | {
      type: "brain_position"
      brainId: string
      payload: BrainPosition
    }
  | {
      type: "challenge"
      fromBrainId: string
      toBrainId: string
      message: string
    }
  | {
      type: "position_update"
      brainId: string
      changedMind: boolean
      payload: BrainPosition
    }
  | {
      type: "decision_board"
      payload: DecisionBoard
    }


WebSockets or server-sent events are acceptable.

If streaming creates unnecessary complexity, simulate progressive rendering on the frontend after the server has completed the orchestration.

Favor reliability.

34. Decision Board Schema

Use a structured schema similar to:

type DecisionBoard = {
  headlineRecommendation: string

  vote: {
    option: string
    count: number
    brainIds: string[]
  }[]

  confidence: number

  agreements: string[]

  disagreements: {
    issue: string
    explanation: string
    brainIds: string[]
  }[]

  assumptions: DecisionAssumption[]

  strongestArgumentFor: string
  strongestArgumentAgainst: string

  minorityOpinion?: {
    brainId: string
    argument: string
  }

  leastReversibleMistake: string

  smallestNextAction: string

  whatWouldChangeDecision: string[]
}


35. MVP Scope

The first production-ready MVP should include:

Landing page.

Problem input.

Context collection.

Brain selection.

Recommended Roundtables.

Approximately 12–15 system brains.

Balance warning.

Brain interrogation questions.

Three-stage Roundtable debate.

Cross-examination.

Changed-mind detection.

Decision Board.

Assumption mapping.

“Test This Assumption.”

User's own final decision.

Authentication.

Saved decision history.

Public/private sharing.

Mobile responsive UI.

Basic usage limits.

Do not build the marketplace, creator economy, teams, or social network before this loop feels excellent.

36. Most Important User Journey

Optimize first for this exact journey:

The user opens Borrowed Brain.

They see:

What's on your mind?

They type:

I'm considering quitting my job to build a startup. I have about nine months of savings and two potential customers, but neither has paid yet.

The app suggests:

Startup Council

Operator

Investor

Skeptic

Scientist

80-Year-Old You

The brains ask:

Operator:

Can you test the startup while still employed?

Investor:

If this succeeds, how large could the opportunity become?

Skeptic:

What evidence suggests either potential customer will actually pay?

Scientist:

What result over the next 30 days would make quitting objectively more justified?

80-Year-Old You:

Which regret feels larger: trying too early or waiting too long?

The user answers.

The Roundtable begins.

Operator recommends testing immediately without quitting.

Investor initially leans toward quitting.

Skeptic argues there is insufficient evidence.

Scientist proposes a revenue experiment.

80-Year-Old You favors taking the shot but not recklessly.

After cross-examination, Investor changes from:

QUIT

to:

RUN A 30-DAY PAID VALIDATION TEST

The Decision Board shows:

Most Supported
Do not quit yet. Run a 30-day paid validation test.

Vote
4 Test First
1 Quit

Critical assumption
Potential customers are willing to pay.

What would resolve it
Get two customers to commit money.

Smallest next action
Ask both potential customers for a paid pilot this week.

The user chooses:

My decision: Ask for paid pilots and revisit quitting in 30 days.

They save the decision and optionally schedule a review.

This flow should feel excellent before adding anything else.

37. Tone

The application copy should be concise and intelligent.

Avoid language like:

AI-powered decision engine;

multi-agent reasoning orchestration;

autonomous agent swarm.

User-facing language should instead use:

brains;

perspectives;

Roundtable;

assumptions;

arguments;

decisions;

changed minds.

The technical implementation may use agents internally, but the consumer product should not feel like developer tooling.

38. Suggested Product Copy

Landing hero:

Borrow another brain.

One problem. Five ways of thinking.

CTA:

Start a Roundtable

Input placeholder:

What are you trying to decide?

Brain selection:

Who should think about this?

Roundtable start:

Put it on the table

Interrogation:

Before they argue, they have questions.

Debate:

The table is divided.

Changed stance:

The Skeptic changed their mind.

Decision Board:

Here's what the table sees.

Assumptions:

Your decision turns on these assumptions.

User decision:

Now it's your call.

Save:

Remember this decision

Review:

How did it turn out?

39. Implementation Quality

Prioritize:

clean architecture;

typed models;

structured LLM outputs;

schema validation;

graceful AI errors;

retries;

loading states;

persistence;

privacy;

fast perceived performance;

responsive design.

Avoid prematurely complex infrastructure.

The MVP should be maintainable by a small team or solo founder.

Use the simplest production-ready stack appropriate to the environment.

If the stack is not predetermined, prefer mainstream technologies with strong ecosystem support.

A reasonable default is:

React / Next.js;

TypeScript;

Tailwind;

PostgreSQL;

authentication provider;

server-side LLM calls;

Stripe-ready subscription architecture.

But remain stack-agnostic if the hosting/build environment recommends something else.

40. Analytics

Track product events such as:

decision_started
decision_context_completed
roundtable_recommended
brain_selected
brain_removed
interrogation_answered
debate_started
debate_skipped
brain_changed_mind
decision_board_viewed
assumption_test_clicked
user_decision_saved
decision_shared
decision_review_scheduled
decision_review_completed
signup_after_decision


The most important activation metric is:

User reaches Decision Board.

A stronger success metric is:

User records their own decision after viewing the Roundtable.

A long-term retention metric is:

User returns to review or make another decision.

41. Non-Goals

Do not initially turn Borrowed Brain into:

a general AI assistant;

a ChatGPT clone;

a social network;

a project management tool;

a therapy product;

a financial advisory platform;

a legal advice product;

a fully autonomous agent system.

The product should stay focused on:

Helping someone examine one decision through multiple genuinely different ways of thinking.

42. Final Product Standard

The experience should create an immediate feeling of:

“I hadn't thought about it that way.”

The best Borrowed Brain session should not merely make the user feel that the AI was smart.

It should make the user understand why reasonable thinkers disagree about their decision.

The fundamental product loop is:

Bring a problem.
Borrow some brains.
Let them disagree.
Discover the assumptions.
Make your decision.
See later whether you were right.

Build that loop first and make it exceptional.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://borrowed-thinking-lab.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/42de119c-43f5-4f45-a9f0-342b8943ac04).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
