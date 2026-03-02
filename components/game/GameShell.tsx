"use client";

import { useRef, useState } from "react";
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleHelp, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-toggle";
import SetupPhase from "./SetupPhase";
import CountdownPhase from "./CountdownPhase";
import RoundPhase from "./RoundPhase";
import GameOverPhase from "./GameOverPhase";
import TeamScoreboard from "./TeamScoreboard";

function GameInner() {
  const { state, dispatch, hydrated } = useGame();
  const playerRef = useRef<YouTubePlayerRef | null>(null);
  const { dark, mounted, toggle } = useTheme();
  const [helpOpen, setHelpOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {mounted && (
              <DropdownMenuItem onSelect={toggle} className="cursor-pointer">
                {dark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {dark ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setHelpOpen(true)} className="cursor-pointer">
              <CircleHelp className="mr-2 h-4 w-4" />
              How to play
            </DropdownMenuItem>
            {isInMatch && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setExitOpen(true)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Exit Match
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Help dialog */}
      <AlertDialog open={helpOpen} onOpenChange={setHelpOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>How to play 🎶</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">1. Set up the match</strong><br />
                  Paste a YouTube playlist link, set the number of teams, and choose the snippet duration for each song.
                </p>
                <p>
                  <strong className="text-foreground">2. Listen to the snippet</strong><br />
                  Each round, a short snippet of a song will play. Teams must pay attention and try to recognize the song from just that snippet!
                </p>
                <p>
                  <strong className="text-foreground">3. Guess the song</strong><br />
                  After the snippet, teams get a chance to answer. The host picks which team answers first. The team has 15 seconds to discuss and give their answer. If they get it wrong, other teams can try.
                </p>
                <p>
                  <strong className="text-foreground">4. Score and win</strong><br />
                  The team that guesses correctly earns points. The first team to reach the target score wins the match!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Got it!</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit match dialog */}
      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit match?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave the current match? Your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveMatch}
              className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
            >
              Exit Match
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
