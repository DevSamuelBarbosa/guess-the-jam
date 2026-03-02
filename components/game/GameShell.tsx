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
import { CircleHelp, Globe, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-toggle";
import { I18nProvider, useI18n } from "@/lib/i18n";
import SetupPhase from "./SetupPhase";
import CountdownPhase from "./CountdownPhase";
import RoundPhase from "./RoundPhase";
import GameOverPhase from "./GameOverPhase";
import TeamScoreboard from "./TeamScoreboard";

function GameInner() {
  const { state, dispatch, hydrated } = useGame();
  const playerRef = useRef<YouTubePlayerRef | null>(null);
  const { dark, mounted, toggle } = useTheme();
  const { t, toggleLocale } = useI18n();
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
                {dark ? t.lightMode : t.darkMode}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={toggleLocale} className="cursor-pointer">
              <Globe className="mr-2 h-4 w-4" />
              {t.language}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setHelpOpen(true)} className="cursor-pointer">
              <CircleHelp className="mr-2 h-4 w-4" />
              {t.howToPlay}
            </DropdownMenuItem>
            {isInMatch && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setExitOpen(true)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.exitMatch}
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
            <AlertDialogTitle>{t.helpTitle}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">{t.helpStep1Title}</strong><br />
                  {t.helpStep1Desc}
                </p>
                <p>
                  <strong className="text-foreground">{t.helpStep2Title}</strong><br />
                  {t.helpStep2Desc}
                </p>
                <p>
                  <strong className="text-foreground">{t.helpStep3Title}</strong><br />
                  {t.helpStep3Desc}
                </p>
                <p>
                  <strong className="text-foreground">{t.helpStep4Title}</strong><br />
                  {t.helpStep4Desc}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">{t.helpGotIt}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit match dialog */}
      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.exitMatchTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.exitMatchDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveMatch}
              className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
            >
              {t.exitMatch}
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
              {t.scoreboard}
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
    <I18nProvider>
      <GameProvider>
        <GameInner />
      </GameProvider>
    </I18nProvider>
  );
}
