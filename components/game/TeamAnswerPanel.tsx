"use client";

import { useGame } from "@/hooks/useGameReducer";
import { Button } from "@/components/ui/button";
import { teamsAvailableToGuess } from "@/lib/game/selectors";

export default function TeamAnswerPanel() {
  const { state, dispatch } = useGame();

  if (state.phase !== "guessing" || !state.round) return null;

  const available = teamsAvailableToGuess(state);
  const selected = state.round.answeringTeamId;

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
        <div className="flex gap-3 pt-2">
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
      )}

      {available.length === 0 && !selected && (
        <p className="text-muted-foreground">
          All teams attempted. No one got it!
        </p>
      )}
    </div>
  );
}
