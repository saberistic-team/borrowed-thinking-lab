# Borrowed Brain — MVP Plan

Borrow another brain. One problem. Five ways of thinking.

A decision-support app where a user brings a real decision, picks up to five "brains" with genuinely different worldviews, watches them interrogate and debate the problem, and ends with a structured Decision Board plus their own recorded decision.

## Scope of this build

The full loop from §35/§36 of the brief:

Problem → Context → Choose Brains (with recommended Roundtables + balance warning) → Interrogation → 3-round Debate → Decision Board → Your Decision → Save / Review / Share.

Not in this build: marketplace payments, creator payouts, Brain Battles, teams, custom-brain builder UI (schema and tables prepared, builder deferred).

## Screens

1. **Home (`/`)** — big headline, one textarea with rotating placeholders ("Should I take this job?"), "Think About It" CTA. Below: recommended Roundtables, popular brains, and recent saved decisions once signed in.
2. **Setup (`/d/$decisionId/setup`)** — confirm the problem, add optional context (background, constraints, desired outcome, deadline, stakes, alternatives already tried), then pick brains. Brain cards show tagline, key traits, a small stat bar visual, and what the brain optimizes for. Buttons: "Recommend a Roundtable" and "Surprise Me". A non-blocking balance note appears when the table skews (e.g. "Your table is heavily weighted toward caution — add an Optimist").
3. **Interrogation (`/d/$decisionId/questions`)** — 3–5 non-redundant questions, one per brain, in a calm conversational flow. Answer, partially answer, or skip.
4. **Debate (`/d/$decisionId/debate`)** — visual roundtable of seated brains. Round 1 positions with stance chips, Round 2 cross-examination shown as directed challenges between two brains, Round 3 updated positions with explicit "The Skeptic changed their mind" moments. Server completes orchestration; the client reveals it progressively with quick transitions. Controls: pause, expand reasoning, skip to Decision Board.
5. **Decision Board (`/d/$decisionId/board`)** — headline recommendation, vote tally, model-derived confidence (labeled as such), where they agree, where they disagree and *why* (root-cause explanation), ranked critical assumptions with "what would change this" and a "Test This Assumption" action that generates a small concrete experiment, strongest argument for/against, least reversible mistake, smallest next action, minority opinion.
6. **Your decision** — inline on the board: follow the recommendation, choose another option, or not ready; freeform text plus a 0–100 confidence slider. Then "Remember this decision" (prompts sign-in if anonymous) and optional review scheduling (1 week / 1 month / 3 months / custom).
7. **Decisions (`/decisions`, `/decisions/$id`)** — history cards with title, date, brains, recommendation, the user's decision, confidence, review status. Review flow asks how it turned out, what happened, which assumption was wrong, which brain was most useful. A light insights strip summarizes patterns once there are enough records ("You tend to pick action-oriented brains") with honest framing.
8. **Brains (`/brains`, `/brains/$slug`)** — browse all system brains by category with full worldview detail: priorities, beliefs, decision rules, characteristic questions, blind spots, and what changes its mind.
9. **Roundtables (`/roundtables`)** — the prebuilt councils (Startup, Money, Career, Relationship, Creative), each startable in one click.
10. **Share (`/s/$shareSlug`)** — an attractive public page with per-decision visibility controls (everything / hide context / board only / private) and a copy-link button. Private by default.
11. **Auth (`/auth`)** — email + Google. The first decision runs anonymously; sign-in is only requested at save time.

## The brains

15 system brains shipped as typed, seeded data — Operator, Skeptic, Optimist, Investor, Scientist, Minimalist, Contrarian, Negotiator, Strategist, Risk Manager, Empath, Customer, 80-Year-Old You, First-Principles Thinker, plus Surprise Me as a picker. Each carries the full schema from §3 (priorities, beliefs, decision rules, characteristic questions, blind spots, change-mind conditions, seven 0–100 stats, time horizon, category) and a simple abstract icon identity — no photoreal faces, no impersonation of real people.

## Design direction

A small council chamber: calm, premium, slightly philosophical, a little playful. Circular seating motif, worldview cards, subtle connection lines during cross-examination, quiet vote indicators. Generous whitespace, strong readable typography, restrained palette with one warm accent — no gradients-on-white AI look, no enterprise dashboard. Deliberate on both mobile and desktop.

## Safety

Medical, self-harm, legal, and high-stakes financial topics get a calm caution note encouraging qualified professional support. Brains are framed as reasoning lenses, never as credentialed professionals.

## Technical section

- **Stack:** the project's TanStack Start + React + Tailwind setup. Lovable Cloud is enabled for database, auth, and storage.
- **Orchestration:** all model calls run server-side through Lovable AI (`google/gemini-3.7-flash`) inside `createServerFn` handlers, one stage per call with its own system instructions — classify decision, recommend brains, generate interrogation questions, generate independent positions, cluster real disagreements, select cross-examination pairs, generate challenges, generate updated positions, detect changed minds, extract and rank assumptions, synthesize the board, propose the smallest next action. Every stage uses a Zod-validated structured schema with one retry on invalid output. A shared base prompt injects each brain's schema and enforces: stay faithful to the worldview, concede strong arguments, no theatrical disagreement, separate fact from assumption, state uncertainty, stay concise.
- **Disagreement integrity:** a dedicated stage classifies each disagreement by type (assumptions, risk tolerance, time horizon, probability estimates, values, opportunity cost, definition of success) before any challenge is written, and the board explains the root cause.
- **Persistence:** Postgres tables for users/profiles, brains, roundtables, roundtable_brains, decisions, decision_brains, interrogation_questions, interrogation_answers, brain_positions, debate_messages, decision_assumptions, decision_boards, decision_reviews, saved_brains, shared_decisions, subscriptions (tier fields present so billing can be added later). RLS scopes every user row to `auth.uid()`; system brains and published share pages are readable by anon through narrow policies. Every generated artifact is stored so revisiting a decision never re-runs the model.
- **Anonymous first run:** the pre-auth decision lives in browser storage and is claimed into the account on sign-in.
- **Usage limits:** a per-week roundtable counter on the free tier, enforced server-side.
- **Analytics:** the §40 event names emitted through a single thin client helper.
- **Errors:** gateway failures surface as clear in-app messages (including the credits case), never as a fake assistant answer; each stage has a visible retry.
