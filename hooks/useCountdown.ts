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

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          stop();
          onEndRef.current?.();
          return 0;
        }
        onTickRef.current?.(next);
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, stop]);

  return { remaining, running, start, stop };
}
