"use client";

import { useRef } from "react";
import { GameProvider, useGame } from "@/hooks/useGameReducer";
import YouTubePlayer, {
  type YouTubePlayerRef,
} from "@/components/youtube/YouTubePlayer";
import SetupPhase from "./SetupPhase";
import CountdownPhase from "./CountdownPhase";
import RoundPhase from "./RoundPhase";
import GameOverPhase from "./GameOverPhase";
import TeamScoreboard from "./TeamScoreboard";

function GameInner() {
  const { state, dispatch } = useGame();
  const playerRef = useRef<YouTubePlayerRef | null>(null);

  const showScoreboard =
    state.phase === "playing" ||
    state.phase === "guessing" ||
    state.phase === "round-result";

  return (
    <div className="relative min-h-screen">
      {/* Hidden YouTube player — always mounted */}
      <YouTubePlayer
        ref={playerRef}
        onSnippetEnd={() => dispatch({ type: "PLAYBACK_ENDED" })}
        onError={(code) => {
          // 101/150 = embed restricted → skip song
          if (code === 101 || code === 150) {
            dispatch({ type: "NEXT_ROUND" });
          }
        }}
      />

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:flex-row">
        {/* Main content */}
        <main className="flex-1">
          {state.phase === "setup" && <SetupPhase />}
          {state.phase === "countdown" && <CountdownPhase />}
          {(state.phase === "playing" ||
            state.phase === "guessing" ||
            state.phase === "round-result") && (
            <RoundPhase playerRef={playerRef} />
          )}
          {state.phase === "game-over" && <GameOverPhase />}
        </main>

        {/* Sidebar scoreboard during active play */}
        {showScoreboard && (
          <aside className="w-full md:w-64 shrink-0">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Scoreboard
            </h3>
            <TeamScoreboard />
          </aside>
        )}
      </div>
    </div>
  );
}

export default function GameShell() {
  return (
    <GameProvider>
      <GameInner />
    </GameProvider>
  );
}
