"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
  useCallback,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  gameReducer,
  initialGameState,
  type GameAction,
} from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";

const STORAGE_KEY = "guess-the-jam-state";

/** Try to load persisted state from sessionStorage. */
function loadPersistedState(): GameState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: GameState = JSON.parse(raw);

    // If restored into the "playing" phase (snippet was in progress),
    // jump to "guessing" — the host can replay via player controls.
    if (parsed.phase === "playing") {
      return { ...parsed, phase: "guessing" };
    }
    // If restored during countdown, restart it from the beginning
    if (parsed.phase === "countdown") {
      return { ...parsed, phase: "countdown", countdownRemaining: 10 };
    }

    return parsed;
  } catch {
    return null;
  }
}

/** Persist state to sessionStorage. */
function persistState(state: GameState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — ignore
  }
}

/** Clear persisted state. */
export function clearPersistedState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  hydrated: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  // Always start with the default state (matches SSR).
  // We'll hydrate from sessionStorage in a useEffect after mount.
  const [state, rawDispatch] = useReducer(gameReducer, initialGameState);
  const [hydrated, setHydrated] = useState(false);
  const isRestoringRef = useRef(false);

  // Hydrate from sessionStorage after mount (client-only)
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      isRestoringRef.current = true;
      rawDispatch({ type: "RESTORE_STATE", state: persisted });
    }
    setHydrated(true);
  }, []);

  const dispatch: Dispatch<GameAction> = useCallback(
    (action) => {
      rawDispatch(action);
    },
    []
  );

  // Persist every state change (after hydration)
  useEffect(() => {
    // Skip the initial render and the restoration dispatch
    if (!hydrated) return;
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }

    // Don't persist empty setup
    if (state.phase === "setup" && state.songs.length === 0 && state.teams.length === 0) {
      return;
    }
    persistState(state);
  }, [state, hydrated]);

  // Clear storage when game is fully reset
  useEffect(() => {
    if (state.phase === "setup" && state.songs.length === 0) {
      clearPersistedState();
    }
  }, [state.phase, state.songs.length]);

  return (
    <GameContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within a <GameProvider>");
  }
  return ctx;
}
