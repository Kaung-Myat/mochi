"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultGameFeedbackPrefs,
  readGameFeedbackPrefs,
  triggerGameFeedback,
  writeGameFeedbackPrefs,
  type FeedbackKind,
  type GameFeedbackPrefs,
} from "@/lib/game/feedback";

type GameFeedbackContextValue = {
  prefs: GameFeedbackPrefs;
  ready: boolean;
  setSound: (value: boolean) => void;
  setHaptics: (value: boolean) => void;
  play: (kind: FeedbackKind) => void;
};

const GameFeedbackContext = createContext<GameFeedbackContextValue | null>(null);

export function GameFeedbackProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<GameFeedbackPrefs>(defaultGameFeedbackPrefs);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefs(readGameFeedbackPrefs());
    setReady(true);
  }, []);

  const commit = useCallback((next: GameFeedbackPrefs) => {
    setPrefs(next);
    writeGameFeedbackPrefs(next);
  }, []);

  const play = useCallback(
    (kind: FeedbackKind) => {
      triggerGameFeedback(kind, prefs);
    },
    [prefs],
  );

  const value = useMemo<GameFeedbackContextValue>(
    () => ({
      prefs,
      ready,
      setSound(value) {
        const next = { ...prefs, sound: value };
        commit(next);
        if (value) triggerGameFeedback("select", next);
      },
      setHaptics(value) {
        const next = { ...prefs, haptics: value };
        commit(next);
        if (value) triggerGameFeedback("tap", { ...next, sound: false });
      },
      play,
    }),
    [prefs, ready, commit, play],
  );

  return <GameFeedbackContext.Provider value={value}>{children}</GameFeedbackContext.Provider>;
}

export function useGameFeedback() {
  const value = useContext(GameFeedbackContext);
  if (!value) {
    return {
      prefs: defaultGameFeedbackPrefs,
      ready: false,
      setSound() {},
      setHaptics() {},
      play() {},
    } satisfies GameFeedbackContextValue;
  }
  return value;
}
