import type { GameState, PlaybackDuration, Song, Team } from "./types";
import { COUNTDOWN_SECONDS, DEFAULT_PLAYBACK_DURATION, WIN_SCORE } from "./constants";
import { shuffle } from "@/lib/utils/shuffle";

// ─── Actions ───

export type GameAction =
  | { type: "SET_PLAYLIST"; songs: Song[] }
  | { type: "ADD_TEAM"; team: Team }
  | { type: "REMOVE_TEAM"; teamId: string }
  | { type: "SET_PLAYBACK_DURATION"; duration: PlaybackDuration }
  | { type: "START_GAME" }
  | { type: "COUNTDOWN_TICK" }
  | { type: "COUNTDOWN_END" }
  | { type: "PLAYBACK_ENDED" }
  | { type: "SELECT_ANSWERING_TEAM"; teamId: string }
  | { type: "MARK_CORRECT" }
  | { type: "MARK_INCORRECT" }
  | { type: "REVEAL_ANSWER" }
  | { type: "NEXT_ROUND" }
  | { type: "RESET_GAME" };

// ─── Initial state ───

export const initialGameState: GameState = {
  phase: "setup",
  teams: [],
  songs: [],
  currentRoundIndex: 0,
  round: null,
  playbackDuration: DEFAULT_PLAYBACK_DURATION,
  countdownRemaining: COUNTDOWN_SECONDS,
  winnerId: null,
};

// ─── Helpers ───

function makeRound(songIndex: number): GameState["round"] {
  return {
    songIndex,
    answeringTeamId: null,
    teamsAttempted: [],
    revealed: false,
  };
}

// ─── Reducer ───

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_PLAYLIST":
      return { ...state, songs: action.songs };

    case "ADD_TEAM":
      return { ...state, teams: [...state.teams, action.team] };

    case "REMOVE_TEAM":
      return {
        ...state,
        teams: state.teams.filter((t) => t.id !== action.teamId),
      };

    case "SET_PLAYBACK_DURATION":
      return { ...state, playbackDuration: action.duration };

    case "START_GAME": {
      const shuffled = shuffle(state.songs);
      return {
        ...state,
        phase: "countdown",
        songs: shuffled,
        currentRoundIndex: 0,
        countdownRemaining: COUNTDOWN_SECONDS,
        round: null,
        winnerId: null,
        teams: state.teams.map((t) => ({ ...t, score: 0 })),
      };
    }

    case "COUNTDOWN_TICK":
      return {
        ...state,
        countdownRemaining: Math.max(0, state.countdownRemaining - 1),
      };

    case "COUNTDOWN_END":
      return {
        ...state,
        phase: "playing",
        round: makeRound(0),
      };

    case "PLAYBACK_ENDED":
      return { ...state, phase: "guessing" };

    case "SELECT_ANSWERING_TEAM":
      if (!state.round) return state;
      return {
        ...state,
        round: { ...state.round, answeringTeamId: action.teamId },
      };

    case "MARK_CORRECT": {
      if (!state.round || !state.round.answeringTeamId) return state;

      const scoringTeamId = state.round.answeringTeamId;
      const updatedTeams = state.teams.map((t) =>
        t.id === scoringTeamId ? { ...t, score: t.score + 1 } : t
      );

      const scoringTeam = updatedTeams.find((t) => t.id === scoringTeamId);
      const won = scoringTeam ? scoringTeam.score >= WIN_SCORE : false;

      if (won) {
        return {
          ...state,
          teams: updatedTeams,
          phase: "game-over",
          winnerId: scoringTeamId,
          round: { ...state.round, revealed: true },
        };
      }

      return {
        ...state,
        teams: updatedTeams,
        phase: "round-result",
        round: { ...state.round, revealed: true },
      };
    }

    case "MARK_INCORRECT": {
      if (!state.round || !state.round.answeringTeamId) return state;

      const attempted = [
        ...state.round.teamsAttempted,
        state.round.answeringTeamId,
      ];

      const allFailed = attempted.length >= state.teams.length;

      if (allFailed) {
        return {
          ...state,
          phase: "round-result",
          round: {
            ...state.round,
            teamsAttempted: attempted,
            answeringTeamId: null,
            revealed: true,
          },
        };
      }

      return {
        ...state,
        round: {
          ...state.round,
          teamsAttempted: attempted,
          answeringTeamId: null,
        },
      };
    }

    case "REVEAL_ANSWER":
      if (!state.round) return state;
      return {
        ...state,
        round: { ...state.round, revealed: true },
      };

    case "NEXT_ROUND": {
      const nextIndex = state.currentRoundIndex + 1;

      // If all songs used, end game with highest score
      if (nextIndex >= state.songs.length) {
        const best = state.teams.reduce((a, b) =>
          a.score >= b.score ? a : b
        );
        return {
          ...state,
          phase: "game-over",
          winnerId: best.id,
          round: null,
        };
      }

      return {
        ...state,
        phase: "playing",
        currentRoundIndex: nextIndex,
        round: makeRound(nextIndex),
      };
    }

    case "RESET_GAME":
      return { ...initialGameState };

    default:
      return state;
  }
}
