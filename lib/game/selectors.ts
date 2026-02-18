import type { GameState, Song, Team } from "./types";
import { WIN_SCORE } from "./constants";

/** Get the current song for this round, or null if no round is active. */
export function currentSong(state: GameState): Song | null {
  if (state.round === null) return null;
  return state.songs[state.round.songIndex] ?? null;
}

/** Get a team by ID. */
export function teamById(state: GameState, id: string): Team | undefined {
  return state.teams.find((t) => t.id === id);
}

/** Check if any team has reached the winning score. */
export function isGameOver(state: GameState): boolean {
  return state.teams.some((t) => t.score >= WIN_SCORE);
}

/** The winning team, or null if nobody won yet. */
export function winner(state: GameState): Team | null {
  return state.teams.find((t) => t.score >= WIN_SCORE) ?? null;
}

/** Teams that haven't attempted a guess this round. */
export function teamsAvailableToGuess(state: GameState): Team[] {
  if (!state.round) return [];
  return state.teams.filter(
    (t) => !state.round!.teamsAttempted.includes(t.id)
  );
}

/** Whether all teams have attempted (and failed) this round. */
export function allTeamsAttempted(state: GameState): boolean {
  if (!state.round) return false;
  return state.round.teamsAttempted.length >= state.teams.length;
}

/** Whether all songs have been used. */
export function allSongsUsed(state: GameState): boolean {
  return state.currentRoundIndex >= state.songs.length;
}

/** The highest score among all teams. */
export function highestScore(state: GameState): Team | null {
  if (state.teams.length === 0) return null;
  return state.teams.reduce((a, b) => (a.score >= b.score ? a : b));
}
