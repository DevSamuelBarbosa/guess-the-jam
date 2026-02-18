"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/hooks/useGameReducer";
import { currentSong } from "@/lib/game/selectors";
import TeamAnswerPanel from "./TeamAnswerPanel";
import type { YouTubePlayerRef } from "@/components/youtube/YouTubePlayer";

interface RoundPhaseProps {
  playerRef: React.RefObject<YouTubePlayerRef | null>;
}

export default function RoundPhase({ playerRef }: RoundPhaseProps) {
  const { state, dispatch } = useGame();
  const song = currentSong(state);
  const hasPlayed = useRef(false);
  const [listening, setListening] = useState(false);

  // Trigger playback when entering "playing" phase
  useEffect(() => {
    if (state.phase !== "playing" || !song || hasPlayed.current) return;

    const player = playerRef.current;
    if (!player) return;

    hasPlayed.current = true;
    setListening(true);

    player.playSongSnippet(song.videoId, state.playbackDuration);

    // We do NOT dispatch PLAYBACK_ENDED here —
    // the YouTubePlayer's onSnippetEnd callback handles that.
  }, [state.phase, song, state.playbackDuration, playerRef]);

  // Reset the guard when the round changes
  useEffect(() => {
    hasPlayed.current = false;
    setListening(false);
  }, [state.currentRoundIndex]);

  // Also stop listening animation when we move to guessing
  useEffect(() => {
    if (state.phase === "guessing") setListening(false);
  }, [state.phase]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-muted-foreground text-sm">
        Round {state.currentRoundIndex + 1} of {state.songs.length}
      </p>

      {/* ─── Listening indicator ─── */}
      {listening && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="flex items-end gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="inline-block w-2 rounded-full bg-primary animate-pulse"
                style={{
                  height: `${12 + Math.random() * 24}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${0.4 + Math.random() * 0.3}s`,
                }}
              />
            ))}
          </div>
          <p className="text-xl font-semibold">🎵 Listening…</p>
          <p className="text-sm text-muted-foreground">
            {state.playbackDuration}s snippet playing
          </p>
        </div>
      )}

      {/* ─── Song info (visible to host during guessing) ─── */}
      {(state.phase === "guessing" || state.phase === "round-result") && song && (
        <div className="w-full max-w-md rounded-md border bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Answer (host only)</p>
          <p className="text-base font-semibold">{song.title}</p>
          {song.artist && (
            <p className="text-sm text-muted-foreground">{song.artist}</p>
          )}
        </div>
      )}

      {/* ─── Guessing phase ─── */}
      {state.phase === "guessing" && <TeamAnswerPanel />}

      {/* ─── Round result ─── */}
      {state.phase === "round-result" && state.round && (
        <RoundResult />
      )}
    </div>
  );
}

/** Shown between rounds: reveals the answer and lets the host proceed. */
function RoundResult() {
  const { state, dispatch } = useGame();
  const song = currentSong(state);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scoringTeam = state.round?.answeringTeamId
    ? state.teams.find((t) => t.id === state.round!.answeringTeamId)
    : null;

  function handleNextRound() {
    setCountdown(3);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        const next = prev - 1;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          queueMicrotask(() => dispatch({ type: "NEXT_ROUND" }));
          return 0;
        }
        return next;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Show countdown overlay
  if (countdown !== null && countdown > 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <p className="text-lg text-muted-foreground">Next round in…</p>
        <span className="text-7xl font-bold tabular-nums animate-pulse">
          {countdown}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {scoringTeam ? (
        <p className="text-xl font-bold text-green-600">
          ✓ {scoringTeam.name} got it!
        </p>
      ) : (
        <p className="text-xl font-bold text-muted-foreground">
          Nobody got it this round.
        </p>
      )}

      {state.round?.revealed && song && (
        <div className="rounded-md border p-4 text-center">
          <p className="text-sm text-muted-foreground">The answer was:</p>
          <p className="text-lg font-semibold">{song.title}</p>
          {song.artist && (
            <p className="text-sm text-muted-foreground">{song.artist}</p>
          )}
        </div>
      )}

      {!state.round?.revealed && (
        <button
          className="text-sm underline text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => dispatch({ type: "REVEAL_ANSWER" })}
        >
          Reveal answer
        </button>
      )}

      <button
        className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        onClick={handleNextRound}
      >
        Next Round →
      </button>
    </div>
  );
}
