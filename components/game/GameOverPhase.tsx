"use client";

import { useGame } from "@/hooks/useGameReducer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TeamScoreboard from "./TeamScoreboard";

export default function GameOverPhase() {
  const { state, dispatch } = useGame();

  const winnerTeam = state.teams.find((t) => t.id === state.winnerId);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <h2 className="text-4xl font-extrabold tracking-tight">Game Over!</h2>

      {winnerTeam && (
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <span className="text-5xl">🏆</span>
            <p className="text-2xl font-bold">{winnerTeam.name}</p>
            <p className="text-muted-foreground">
              Won with {winnerTeam.score} points!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="w-full max-w-sm">
        <h3 className="mb-3 text-center text-sm font-medium text-muted-foreground">
          Final Scores
        </h3>
        <TeamScoreboard />
      </div>

      <Button
        size="lg"
        variant="outline"
        onClick={() => dispatch({ type: "RESET_GAME" })}
      >
        Play Again
      </Button>
    </div>
  );
}
