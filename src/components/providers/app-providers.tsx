"use client";

import type { ReactNode } from "react";
import { GameFeedbackProvider } from "@/components/game/game-feedback-provider";
import { GameFxLayer } from "@/components/game/game-fx-layer";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GameFeedbackProvider>
      {children}
      <GameFxLayer />
      <PwaInstallPrompt />
    </GameFeedbackProvider>
  );
}
