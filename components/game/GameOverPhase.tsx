"use client";

import { useGame } from "@/hooks/useGameReducer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TeamScoreboard from "./TeamScoreboard";
import { useI18n } from "@/lib/i18n";

export default function GameOverPhase() {
  const { state, dispatch } = useGame();
  const { t } = useI18n();

  const winnerTeam = state.teams.find((team) => team.id === state.winnerId);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <h2 className="text-4xl font-extrabold tracking-tight">{t.gameOver}</h2>

      {winnerTeam && (
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <span className="text-5xl">🏆</span>
            <p className="text-2xl font-bold">{winnerTeam.name}</p>
            <p className="text-muted-foreground">
              {t.wonWith(winnerTeam.score)}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="w-full max-w-sm">
        <h3 className="mb-3 text-center text-sm font-medium text-muted-foreground">
          {t.finalScores}
        </h3>
        <TeamScoreboard />
      </div>

      <div className="flex flex-col gap-3 items-center">
        <Button
          size="lg"
          onClick={() => dispatch({ type: "START_GAME" })}
        >
          {t.playAgainSamePlaylist}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => dispatch({ type: "RESET_GAME" })}
        >
          {t.playAgainNewPlaylist}
        </Button>
      </div>
    </div>
  );
}
