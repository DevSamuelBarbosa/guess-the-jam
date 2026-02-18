"use client";

import { useGame } from "@/hooks/useGameReducer";
import { useCountdown } from "@/hooks/useCountdown";
import { COUNTDOWN_SECONDS } from "@/lib/game/constants";

export default function CountdownPhase() {
  const { dispatch } = useGame();

  const { remaining } = useCountdown({
    from: COUNTDOWN_SECONDS,
    onTick: () => dispatch({ type: "COUNTDOWN_TICK" }),
    onEnd: () => dispatch({ type: "COUNTDOWN_END" }),
    autoStart: true,
  });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-lg text-muted-foreground">Get ready…</p>
      <span
        className="text-9xl font-bold tabular-nums transition-transform duration-200"
        style={{ transform: `scale(${1 + (remaining % 2) * 0.05})` }}
      >
        {remaining}
      </span>
    </div>
  );
}
