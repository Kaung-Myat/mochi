"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useGameFeedback } from "@/components/game/game-feedback-provider";
import { MochiMascot } from "./mochi-mascot";

const loveNotes = [
  "မင်းလာတာနဲ့… Mochi ရဲ့နေ့လေး ပိုချိုသွားပြီ။",
  "မင်းအတွက်ပဲ တိတ်တိတ်လေး စောင့်နေတာနော်။",
  "မင်းပြုံးလိုက်ရင် Mochi လည်း အလိုလိုပျော်သွားတယ်။",
  "ပင်ပန်းရင်… Mochi ကို ပွတ်ပေးပါဦးနော်။",
  "မင်းရှိနေတာတင် Mochi အတွက် လုံလောက်ပြီးသား။",
];

export type CompanionAction = {
  id: "water" | "meals" | "sleep" | "tummy";
  label: string;
  caption: string;
  badge?: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
};

export function CompanionHero({
  greeting,
  name,
  nextUp,
  actions,
}: {
  greeting: string;
  name?: string;
  nextUp: string;
  actions: CompanionAction[];
}) {
  const { play } = useGameFeedback();
  const [noteIndex, setNoteIndex] = useState(0);
  const [petted, setPetted] = useState(false);
  const [bubbleKey, setBubbleKey] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNoteIndex((value) => (value + 1) % loveNotes.length);
      setBubbleKey((value) => value + 1);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  function petMochi() {
    setNoteIndex((value) => (value + 1) % loveNotes.length);
    setBubbleKey((value) => value + 1);
    setPetted(true);
    window.setTimeout(() => setPetted(false), 700);
    play("pet");
  }

  return (
    <section className="companion-stage pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
      <div className="companion-plant" aria-hidden="true" />
      <div
        className="companion-poster absolute top-[22%] right-[18%] z-[1] h-14 w-10 rotate-3 rounded-md border-[3px] border-[#fff7ee] bg-[#7ed957] shadow-md sm:h-16 sm:w-12"
        aria-hidden="true"
      />

      <p className="companion-title">Today with Mochi</p>

      <ActionColumn actions={actions.filter((_, index) => index % 2 === 0)} side="left" />
      <ActionColumn actions={actions.filter((_, index) => index % 2 === 1)} side="right" />

      <div key={bubbleKey} className="companion-bubble companion-speech" role="status">
        <div className="companion-speech-card">
          <p className="companion-speech-tag">MOCHI SAYS</p>
          <p className="companion-speech-line">{loveNotes[noteIndex]}</p>
          <p className="companion-speech-meta">
            {greeting}
            {name ? `၊ ${name}` : ""}
          </p>
          <p className="companion-speech-next">{nextUp}</p>
        </div>
        <span className="companion-speech-tail" aria-hidden="true" />
        <span className="companion-speech-heart" aria-hidden="true">
          ♥
        </span>
      </div>

      <button
        type="button"
        onClick={petMochi}
        aria-label="Pet Mochi"
        className="companion-mascot-slot absolute inset-x-0 z-10 flex touch-manipulation items-end justify-center"
      >
        <span
          className={`pointer-events-none absolute top-4 text-rose-500 ${petted ? "love-burst" : "opacity-0"}`}
          aria-hidden="true"
        >
          ♥
        </span>
        <MochiMascot
          className={`companion-mascot origin-bottom ${petted ? "mochi-petted" : "mochi-idle"}`}
        />
      </button>
    </section>
  );
}

function ActionColumn({ actions, side }: { actions: CompanionAction[]; side: "left" | "right" }) {
  if (actions.length === 0) return null;
  return (
    <div
      className={`companion-actions ${side === "left" ? "companion-actions-left" : "companion-actions-right"}`}
    >
      {actions.map((action) => (
        <ActionButton key={action.id} action={action} />
      ))}
    </div>
  );
}

function ActionButton({ action }: { action: CompanionAction }) {
  const { play } = useGameFeedback();
  const className = `toy-button ${action.active ? "toy-button-active" : ""}`;
  const content = (
    <>
      <ActionIcon id={action.id} />
      {action.badge && <span className="toy-badge">{action.badge}</span>}
    </>
  );

  function handleActivate() {
    play("tap");
    action.onClick?.();
  }

  return (
    <div className="flex flex-col items-center">
      {action.href ? (
        <Link
          href={action.href}
          aria-label={action.label}
          className={className}
          onClick={() => play("tap")}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          aria-pressed={action.active}
          aria-label={action.label}
          onClick={handleActivate}
          className={className}
        >
          {content}
        </button>
      )}
      <span className="toy-caption">{action.caption}</span>
    </div>
  );
}

function ActionIcon({ id }: { id: CompanionAction["id"] }) {
  if (id === "water") return <CupIcon />;
  if (id === "meals") return <ForkIcon />;
  if (id === "sleep") return <MoonIcon />;
  return <BookIcon />;
}

function CupIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 8h8v6a4 4 0 0 1-8 0zM15 10h2a2 2 0 0 1 0 4h-2M8 20h6" />
    </svg>
  );
}
function ForkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 4v7M12 4v7M10 11v9M16 4c1.5 2 2 4 2 6s-1 3-2 3v7" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M15 3a8 8 0 1 0 6 13 7 7 0 0 1-6-13z" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 5h10a2 2 0 0 1 2 2v12H8a2 2 0 0 0-2 2zM6 5v14" />
    </svg>
  );
}
