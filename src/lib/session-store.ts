import { useCallback, useEffect, useState } from "react";

import type { DecisionSession } from "./decision-types";

const KEY = "borrowed-brain:sessions";

function readAll(): Record<string, DecisionSession> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, DecisionSession>;
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, DecisionSession>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("bb:sessions"));
}

export function createSession(problem: string): DecisionSession {
  const session: DecisionSession = {
    id: Math.random().toString(36).slice(2, 10),
    title: problem.slice(0, 60),
    problem,
    context: {},
    selectedBrainIds: [],
    interrogation: [],
    initialPositions: [],
    debateMessages: [],
    finalPositions: [],
    createdAt: new Date().toISOString(),
  };
  const all = readAll();
  all[session.id] = session;
  writeAll(all);
  return session;
}

export function getSession(id: string): DecisionSession | undefined {
  return readAll()[id];
}

export function saveSession(session: DecisionSession) {
  const all = readAll();
  all[session.id] = session;
  writeAll(all);
}

export function useSession(id: string) {
  const [session, setSessionState] = useState<DecisionSession | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessionState(getSession(id));
    setReady(true);
  }, [id]);

  const update = useCallback(
    (patch: Partial<DecisionSession> | ((prev: DecisionSession) => Partial<DecisionSession>)) => {
      setSessionState((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
        saveSession(next);
        return next;
      });
    },
    [],
  );

  return { session, ready, update };
}

export function listLocalSessions(): DecisionSession[] {
  return Object.values(readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
