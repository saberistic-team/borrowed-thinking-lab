type EventName =
  | "decision_started"
  | "decision_context_completed"
  | "roundtable_recommended"
  | "brain_selected"
  | "brain_removed"
  | "interrogation_answered"
  | "debate_started"
  | "debate_skipped"
  | "brain_changed_mind"
  | "decision_board_viewed"
  | "assumption_test_clicked"
  | "user_decision_saved"
  | "decision_shared"
  | "decision_review_scheduled"
  | "decision_review_completed"
  | "signup_after_decision";

type Payload = Record<string, string | number | boolean | undefined>;

const KEY = "borrowed-brain:events";

export function track(event: EventName, payload: Payload = {}) {
  if (typeof window === "undefined") return;
  const entry = { event, payload, at: new Date().toISOString() };
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as unknown[];
    all.push(entry);
    window.localStorage.setItem(KEY, JSON.stringify(all.slice(-300)));
  } catch {
    /* analytics must never break the product */
  }
}
