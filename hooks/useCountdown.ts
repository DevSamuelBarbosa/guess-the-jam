"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCountdownOptions {
  from: number;
  onTick?: (remaining: number) => void;
  onEnd?: () => void;
  autoStart?: boolean;
}

export function useCountdown({
  from,
  onTick,
  onEnd,
  autoStart = true,
}: UseCountdownOptions) {
  const [remaining, setRemaining] = useState(from);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTickRef = useRef(onTick);
  const onEndRef = useRef(onEnd);

  // Keep callbacks refs fresh without restarting interval
  onTickRef.current = onTick;
  onEndRef.current = onEnd;

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setRemaining(from);
    setRunning(true);
  }, [from]);

  // Track the latest remaining value in a ref so the interval callback
  // can read it without depending on React state (avoids calling external
  // callbacks inside a setState updater, which causes the
  // "Cannot update a component while rendering a different component" error).
  const remainingRef = useRef(remaining);
  remainingRef.current = remaining;

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      const next = remainingRef.current - 1;

      if (next <= 0) {
        setRemaining(0);
        stop();
        // Defer to avoid dispatching during another component's render
        queueMicrotask(() => onEndRef.current?.());
        return;
      }

      setRemaining(next);
      queueMicrotask(() => onTickRef.current?.(next));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, stop]);

  return { remaining, running, start, stop };
}
