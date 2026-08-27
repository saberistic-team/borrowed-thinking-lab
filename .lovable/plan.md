# Make the Roundtable feel like a live conversation

Right now each stage is one big silent request: the screen waits ~10s for questions, then waits again while all positions, all cross-examination, and all final positions are generated in three monolithic calls. Nothing appears until each stage finishes. The fix is to break the work into per-brain turns and reveal them as a chat-style council transcript, one speaker at a time.

## Experience

**Interrogation (questions step)**
- Instead of a blank spinner, the five seated brains appear immediately as a council row with a "thinking" pulse under each.
- Questions are generated per brain, so each brain's question card drops in as soon as it's ready — the room fills up progressively instead of all at once.

**Roundtable (debate step)** — becomes a transcript, not three stacked lists.
- A persistent council bar at the top: avatars of all seated brains, with the current speaker highlighted (ember ring, subtle scale) and the others dimmed.
- Messages stream into a single vertical conversation feed in speaking order, each with avatar, name, and a typing indicator ("Ash is thinking…") that resolves into the message with a fade/slide-in.
- Round headers separate the three acts: "Round 1 — opening positions", "Round 2 — cross-examination", "Round 3 — final positions".
- Cross-examination renders as directed exchanges: a challenge bubble from the challenger aligned one side, the reply from the challenged aligned the other, connected by a labeled "disagrees on framing / evidence / risk" tag.
- Agreement/disagreement is visible at a glance: stance chips (Strong yes → Strong no) on each avatar in the council bar, updating live when a brain changes its mind (chip flips with an animation and a "Changed mind" flash).
- Auto-scroll follows the newest message, with a "jump to latest" affordance if the user scrolls up.
- A round progress strip shows Round 1 / 2 / 3 with the active one lit, so the wait always has a visible frontier.

**Pacing** — turns are generated in parallel behind the scenes but revealed in sequence with a short beat between them, so it reads as a conversation rather than a data dump. Reveal never blocks on the slowest brain: whoever is ready next speaks next.

**Skip control** — a "Skip the theatre" button reveals everything already generated instantly, for users who don't want the pacing.

## Technical notes

- Split the monolithic stage calls in `src/lib/orchestration.server.ts` into per-brain units: `generateQuestionForBrain`, `generatePositionForBrain`, `generateFinalPositionForBrain`, and per-pair `generateExchange`. Keep the existing whole-stage prompts as the context each unit receives, so output quality and worldview fidelity don't regress. Expose them via new server functions alongside the existing ones in `src/lib/decisions.functions.ts`.
- The debate route runs each stage as a bounded-concurrency fan-out (all brains at once for positions/finals, pairs for cross-examination), pushing results into an ordered queue. A reveal loop pops from the queue in speaking order.
- Persist partial results to the session store as each turn lands, so a refresh mid-debate resumes instead of restarting.
- New presentational components: `council-bar.tsx` (avatars, stance chips, active speaker), `debate-transcript.tsx` (feed + auto-scroll), `speaking-indicator.tsx` (typing dots). Animations use the existing `seat-in`/fade utilities and design tokens — no new color values.
- The questions route reuses the same per-brain reveal, replacing its single-call load and empty-result retry with per-brain retry.
- Respect `prefers-reduced-motion`: skip staggered reveal and typing indicators, render turns immediately.

## Out of scope

No changes to the Decision Board, saving, sharing, reviews, or brain catalog. No websockets or server-side streaming — the pacing is client-side over parallel per-turn requests.
