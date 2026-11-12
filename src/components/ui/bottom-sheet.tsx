"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useGameFeedback } from "@/components/game/game-feedback-provider";

export function BottomSheet({
  open,
  title,
  onClose,
  closeLabel = "Close",
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  closeLabel?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const { play } = useGameFeedback();
  const wasOpen = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && !wasOpen.current) play("sheet");
    wasOpen.current = open;
  }, [open, play]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.sheetOpen = "true";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      delete document.body.dataset.sheetOpen;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="bottom-sheet fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[#2c1a12]/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bottom-sheet-panel absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-t-[1.75rem] border-[3px] border-b-0 border-white bg-[#fffaf5] shadow-[0_-12px_40px_rgb(70_35_25_/_.28)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-3 pb-2">
          <div className="min-w-0 flex-1">
            <div className="mx-auto mb-2.5 h-1.5 w-11 rounded-full bg-stone-300" aria-hidden="true" />
            <h2 id={titleId} className="truncate text-base font-semibold text-[#3a2a24]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 shrink-0 rounded-full border-2 border-[#3a2a24]/15 bg-white px-3.5 text-sm font-semibold text-[#3a2a24]"
          >
            {closeLabel}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
