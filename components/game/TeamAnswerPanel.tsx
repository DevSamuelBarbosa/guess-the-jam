"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/hooks/useGameReducer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { teamsAvailableToGuess } from "@/lib/game/selectors";

const ANSWER_TIME_LIMIT = 15; // seconds

export default function TeamAnswerPanel() {
  const { state, dispatch } = useGame();
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIME_LIMIT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = state.round?.answeringTeamId ?? null;

  // Start / reset / stop the 15-second timer whenever the selected team changes
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!selected) {
      setTimeLeft(ANSWER_TIME_LIMIT);
      return;
    }

    // Start a fresh countdown
    setTimeLeft(ANSWER_TIME_LIMIT);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up — auto-mark incorrect
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          queueMicrotask(() => dispatch({ type: "MARK_INCORRECT" }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [selected, dispatch]);

  if (state.phase !== "guessing" || !state.round) return null;

  const available = teamsAvailableToGuess(state);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-medium">Which team is answering?</p>

      <div className="flex flex-wrap justify-center gap-3">
        {state.teams.map((team) => {
          const isAttempted = state.round!.teamsAttempted.includes(team.id);
          const isSelected = selected === team.id;

          return (
            <Button
              key={team.id}
              variant={isSelected ? "default" : "outline"}
              disabled={isAttempted}
              onClick={() =>
                dispatch({ type: "SELECT_ANSWERING_TEAM", teamId: team.id })
              }
              className="min-w-[120px]"
            >
              {team.name}
              {isAttempted && " ✗"}
            </Button>
          );
        })}
      </div>

      {selected && (
        <div className="flex w-full max-w-sm flex-col items-center gap-3 pt-2">
          {/* Timer bar */}
          <div className="w-full space-y-1">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Time left</span>
              <span className={timeLeft <= 5 ? "font-bold text-destructive" : "tabular-nums"}>
                {timeLeft}s
              </span>
            </div>
            <Progress
              value={(timeLeft / ANSWER_TIME_LIMIT) * 100}
              className="h-2"
            />
          </div>

          {/* Correct / Wrong buttons */}
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={() => dispatch({ type: "MARK_CORRECT" })}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
            >
              Correct ✓
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={() => dispatch({ type: "MARK_INCORRECT" })}
              className="min-w-[120px]"
            >
              Wrong ✗
            </Button>
          </div>
        </div>
      )}

      {available.length === 0 && !selected && (
        <p className="text-muted-foreground">
          All teams attempted. No one got it!
        </p>
      )}
    </div>
  );
}
