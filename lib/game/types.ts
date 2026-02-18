// ─── Domain types for the Guess the Jam game ───

export type PlaybackDuration = 1 | 3 | 5;

export type GamePhase =
  | "setup"
  | "countdown"
  | "playing"
  | "guessing"
  | "round-result"
  | "game-over";

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface Song {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}

export interface RoundState {
  songIndex: number;
  answeringTeamId: string | null;
  teamsAttempted: string[];
  revealed: boolean;
}

export interface GameState {
  phase: GamePhase;
  teams: Team[];
  songs: Song[];
  currentRoundIndex: number;
  round: RoundState | null;
  playbackDuration: PlaybackDuration;
  countdownRemaining: number;
  winnerId: string | null;
}
