"use client";

import { useEffect, useState } from "react";
import type { FeedbackKind } from "@/lib/game/feedback";

type Burst = {
  id: number;
  kind: FeedbackKind;
};

export function GameFxLayer() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    let id = 0;
    function onFx(event: Event) {
      const detail = (event as CustomEvent<{ kind: FeedbackKind }>).detail;
      if (!detail?.kind) return;
      if (detail.kind === "soft") return;
      const nextId = ++id;
      setBursts((current) => [...current.slice(-4), { id: nextId, kind: detail.kind }]);
      window.setTimeout(() => {
        setBursts((current) => current.filter((burst) => burst.id !== nextId));
      }, 520);
      if (detail.kind === "success") {
        document.body.classList.add("fx-success-flash");
        window.setTimeout(() => document.body.classList.remove("fx-success-flash"), 420);
      }
    }
    window.addEventListener("mochi-fx", onFx);
    return () => window.removeEventListener("mochi-fx", onFx);
  }, []);

  if (bursts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[120]" aria-hidden="true">
      {bursts.map((burst) => (
        <div key={burst.id} className={`fx-burst fx-burst-${burst.kind}`}>
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
