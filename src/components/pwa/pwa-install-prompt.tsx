"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useGameFeedback } from "@/components/game/game-feedback-provider";
import { MochiMascot } from "@/components/mascot/mochi-mascot";
import {
  type BeforeInstallPromptEvent,
  isIosDevice,
  isStandaloneDisplay,
  shouldOfferPwaInstall,
  writePwaInstallPrefs,
} from "@/lib/pwa/install";

export function PwaInstallPrompt() {
  const titleId = useId();
  const { play } = useGameFeedback();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  const dismiss = useCallback(
    (mode: "later" | "never") => {
      play("soft");
      writePwaInstallPrefs({
        dismissedAt: Date.now(),
        neverAsk: mode === "never",
      });
      setOpen(false);
    },
    [play],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isStandaloneDisplay()) return;
    if (!shouldOfferPwaInstall()) return;

    setIos(isIosDevice());

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const timer = window.setTimeout(() => {
      if (!isStandaloneDisplay() && shouldOfferPwaInstall()) {
        setOpen(true);
        play("sheet");
      }
    }, 900);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, [mounted, play]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss("later");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  async function install() {
    if (!deferred) return;
    setInstalling(true);
    play("tap");
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") {
        play("success");
        writePwaInstallPrefs({ dismissedAt: Date.now(), neverAsk: true });
        setOpen(false);
      } else {
        dismiss("later");
      }
    } catch {
      dismiss("later");
    } finally {
      setInstalling(false);
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[130] grid place-items-center px-4" role="presentation">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[#2c1a12]/55"
        onClick={() => dismiss("later")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[22rem] overflow-hidden rounded-[1.75rem] border-[3px] border-white bg-[#fffaf5] p-4 shadow-[0_16px_0_#c99578,0_28px_48px_rgb(70_35_25_/_.28)]"
      >
        <div className="pointer-events-none absolute -top-6 -right-4 opacity-90">
          <MochiMascot className="w-28" />
        </div>

        <p className="text-[0.62rem] font-bold tracking-[0.16em] text-[#c45a3c]">HOME SCREEN</p>
        <h2 id={titleId} className="mt-1 max-w-[75%] text-xl font-semibold text-[#3a2a24]">
          Mochi ကို Home မှာ ထားမယ်?
        </h2>
        <p className="mt-2 max-w-[90%] text-sm text-stone-600">
          App လို ဖွင့်သုံးနိုင်အောင် Home Screen ထည့်ထားရင် ပိုမြန်ပြီး သတိပေးချက်လည်း ပိုအဆင်ပြေတယ်။
        </p>

        {ios ? (
          <ol className="mt-4 space-y-2 rounded-[1.25rem] border-2 border-[#f0d2bc] bg-[#fff7ee] px-3 py-3 text-[0.78rem] text-[#3a2a24]">
            <li>
              1. Safari အောက်က <strong>Share</strong> ခလုတ်ကို နှိပ်
            </li>
            <li>
              2. <strong>Add to Home Screen</strong> ကို ရွေး
            </li>
            <li>
              3. <strong>Add</strong> နှိပ်ပြီး ပြီးပါပြီ
            </li>
          </ol>
        ) : (
          <div className="mt-4 rounded-[1.25rem] border-2 border-[#f0d2bc] bg-[#fff7ee] px-3 py-3 text-[0.78rem] text-[#3a2a24]">
            {deferred
              ? "အောက်က Install ကို နှိပ်ပြီး Mochi ကို Home Screen ထည့်လို့ရပြီ။"
              : "Browser ရဲ့ Install / Add to Home Screen option ကို သုံးပြီး ထည့်လို့ရပါတယ်။"}
          </div>
        )}

        <div className="mt-4 grid gap-2">
          {!ios && deferred && (
            <button
              type="button"
              disabled={installing}
              onClick={() => void install()}
              className="min-h-12 rounded-full bg-[#7a45f5] text-sm font-semibold text-white shadow-[0_4px_0_#4520aa] disabled:opacity-50 active:translate-y-0.5 active:shadow-none"
            >
              {installing ? "Install လုပ်နေတယ်…" : "Install လုပ်မယ်"}
            </button>
          )}
          {ios && (
            <button
              type="button"
              onClick={() => dismiss("later")}
              className="min-h-12 rounded-full bg-[#7a45f5] text-sm font-semibold text-white shadow-[0_4px_0_#4520aa] active:translate-y-0.5 active:shadow-none"
            >
              နားလည်ပြီ
            </button>
          )}
          {!ios && !deferred && (
            <button
              type="button"
              onClick={() => dismiss("later")}
              className="min-h-12 rounded-full bg-[#7a45f5] text-sm font-semibold text-white shadow-[0_4px_0_#4520aa] active:translate-y-0.5 active:shadow-none"
            >
              နားလည်ပြီ
            </button>
          )}
          <button
            type="button"
            onClick={() => dismiss("later")}
            className="min-h-11 rounded-full border-2 border-[#3a2a24]/12 bg-white text-sm font-semibold text-[#3a2a24]"
          >
            နောက်မှ
          </button>
          <button
            type="button"
            onClick={() => dismiss("never")}
            className="min-h-9 text-[0.72rem] font-medium text-stone-500"
          >
            ဒီအကြောင်း မမေးတော့ပါနဲ့
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
