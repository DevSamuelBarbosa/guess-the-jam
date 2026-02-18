"use client";

import { useGame } from "@/hooks/useGameReducer";
import { Progress } from "@/components/ui/progress";
import { WIN_SCORE } from "@/lib/game/constants";
import { cn } from "@/lib/utils";

export default function TeamScoreboard() {
  const { state } = useGame();

  if (state.teams.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-3">
      {state.teams.map((team) => {
        const isAnswering =
          state.round?.answeringTeamId === team.id;

        return (
          <div
            key={team.id}
            className={cn(
              "flex flex-col gap-1 rounded-md border p-3 transition-colors",
              isAnswering && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{team.name}</span>
              <span className="tabular-nums text-sm font-medium">
                {team.score} / {WIN_SCORE}
              </span>
            </div>
            <Progress value={(team.score / WIN_SCORE) * 100} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}
