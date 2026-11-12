"use client";

import type { ReactNode } from "react";
import { useGameFeedback } from "@/components/game/game-feedback-provider";

export function GameSettingsPanel() {
  const { prefs, ready, setSound, setHaptics, play } = useGameFeedback();

  return (
    <section className="rounded-[1.6rem] border-[3px] border-white bg-[#fff7ee] p-4 shadow-[0_8px_0_#f0c9a8]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">GAME FEEL</p>
          <h2 className="mt-0.5 text-lg font-semibold text-[#3a2a24]">အသံနဲ့ ထိတွေ့မှု</h2>
          <p className="mt-1 text-sm text-stone-600">Mochi က ဂိမ်းလို တုံ့ပြန်ပေးမယ်။</p>
        </div>
        <button
          type="button"
          disabled={!ready}
          onClick={() => play("success")}
          className="min-h-10 shrink-0 rounded-full border-2 border-[#3a2a24]/12 bg-white px-3 text-[0.72rem] font-semibold text-[#3a2a24] active:scale-95"
        >
          စမ်းကြည့်
        </button>
      </div>

      <div className="mt-4 grid gap-2.5">
        <ToggleRow
          title="Sound FX"
          caption="ခလုတ် / sheet / သိမ်းတဲ့အသံ"
          active={prefs.sound}
          ready={ready}
          onToggle={() => setSound(!prefs.sound)}
          icon={<SoundIcon on={prefs.sound} />}
        />
        <ToggleRow
          title="Haptics"
          caption="ဖုန်းတုန်ခါမှုလေး"
          active={prefs.haptics}
          ready={ready}
          onToggle={() => setHaptics(!prefs.haptics)}
          icon={<HapticIcon on={prefs.haptics} />}
        />
      </div>
    </section>
  );
}

function ToggleRow({
  title,
  caption,
  active,
  ready,
  onToggle,
  icon,
}: {
  title: string;
  caption: string;
  active: boolean;
  ready: boolean;
  onToggle: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={!ready}
      aria-pressed={active}
      onClick={onToggle}
      className={`flex min-h-14 w-full items-center gap-3 rounded-[1.25rem] border-[3px] px-3 text-left transition active:scale-[0.99] ${
        active
          ? "border-[#3a2a24] bg-[#ffd15c] shadow-[0_3px_0_#e2b000]"
          : "border-[#f0d2bc] bg-white"
      }`}
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-white/80 text-[#3a2a24]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#3a2a24]">{title}</span>
        <span className="block text-[0.72rem] text-[#6b5548]">{caption}</span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition ${
          active ? "border-[#3a2a24] bg-[#3a2a24]" : "border-[#d7b9a6] bg-[#efe0d4]"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${
            active ? "left-5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 10v4h3l4 3V7L7 10H4Z" />
      {on ? <path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10" /> : <path d="m15 10 4 4M19 10l-4 4" />}
    </svg>
  );
}

function HapticIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="8" y="3.5" width="8" height="17" rx="2.2" />
      {on ? <path d="M4 9v6M20 9v6" /> : <path d="M4 11h0M20 11h0" opacity="0.35" />}
    </svg>
  );
}
