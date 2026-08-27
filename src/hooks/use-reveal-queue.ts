import { useCallback, useEffect, useRef, useState } from "react";

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Reveals items one at a time, in arrival order, with a "who is speaking now"
 * beat between them so generated turns read as a conversation.
 */
export function useRevealQueue<T>(speakerOf: (item: T) => string, delay = 850) {
  const [queue, setQueue] = useState<T[]>([]);
  const [revealed, setRevealed] = useState<T[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [instant, setInstant] = useState(false);
  const speakerRef = useRef(speakerOf);
  speakerRef.current = speakerOf;

  useEffect(() => {
    if (queue.length === 0) {
      setSpeakingId(null);
      return;
    }
    const next = queue[0]!;
    const fast = instant || prefersReducedMotion();
    setSpeakingId(fast ? null : speakerRef.current(next));
    const timer = window.setTimeout(
      () => {
        setRevealed((prev) => [...prev, next]);
        setQueue((prev) => prev.slice(1));
        setSpeakingId(null);
      },
      fast ? 0 : delay,
    );
    return () => window.clearTimeout(timer);
  }, [queue, instant, delay]);

  const push = useCallback((...items: T[]) => setQueue((prev) => [...prev, ...items]), []);
  const seed = useCallback((items: T[]) => {
    setQueue([]);
    setRevealed(items);
  }, []);
  const skip = useCallback(() => setInstant(true), []);
  const reset = useCallback(() => {
    setQueue([]);
    setRevealed([]);
    setInstant(false);
  }, []);

  return { revealed, pending: queue.length, speakingId, push, seed, skip, reset, instant };
}
