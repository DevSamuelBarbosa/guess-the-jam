"use client";

import { useRef } from "react";
import { GameProvider, useGame, clearPersistedState } from "@/hooks/useGameReducer";
import YouTubePlayer, {
  type YouTubePlayerRef,
} from "@/components/youtube/YouTubePlayer";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ThemeToggle from "@/components/ui/theme-toggle";
import SetupPhase from "./SetupPhase";
import CountdownPhase from "./CountdownPhase";
import RoundPhase from "./RoundPhase";
import GameOverPhase from "./GameOverPhase";
import TeamScoreboard from "./TeamScoreboard";

function GameInner() {
  const { state, dispatch, hydrated } = useGame();
  const playerRef = useRef<YouTubePlayerRef | null>(null);

  const showScoreboard =
    state.phase === "playing" ||
    state.phase === "guessing" ||
    state.phase === "round-result";

  const isInMatch = state.phase !== "setup";

  function handleLeaveMatch() {
    playerRef.current?.stop();
    clearPersistedState();
    dispatch({ type: "RESET_GAME" });
  }

  // Show a brief loading state while restoring from sessionStorage
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Top bar */}
      <div className="mx-auto flex max-w-4xl items-center justify-end gap-2 px-4 pt-4">
        <ThemeToggle />
        {isInMatch && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
              >
                Sair da partida
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sair da partida?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todo o progresso será perdido e não poderá ser recuperado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLeaveMatch}
                  className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
                >
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:flex-row">
        {/* Main content */}
        <main className="flex flex-1 flex-col items-center gap-6">
          {/* YouTube player — visible during rounds, hidden otherwise */}
          <YouTubePlayer
            ref={playerRef}
            visible={showScoreboard}
            onSnippetEnd={() => dispatch({ type: "PLAYBACK_ENDED" })}
            onError={(code) => {
              // 101/150 = embed restricted → skip song
              if (code === 101 || code === 150) {
                dispatch({ type: "NEXT_ROUND" });
              }
            }}
          />
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
