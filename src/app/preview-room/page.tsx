"use client";

import { useState } from "react";
import { CompanionHero, type CompanionAction } from "@/components/mascot/companion-hero";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";

export default function PreviewRoomPage() {
  const [open, setOpen] = useState(false);
  const actions: CompanionAction[] = [
    {
      id: "water",
      label: "Water",
      caption: "ရေ",
      badge: "0/8",
      active: open,
      onClick: () => setOpen(true),
    },
    { id: "meals", label: "Meals", caption: "စား", badge: "2/3", onClick: () => undefined },
    { id: "sleep", label: "Sleep", caption: "အိပ်", badge: "23:00", onClick: () => undefined },
    { id: "tummy", label: "Diary", caption: "ဗိုက်", href: "/tummy" },
  ];

  return (
    <>
      <main className="fixed inset-0 overflow-hidden">
        <CompanionHero greeting="မင်္ဂလာပါ" name="Kaung" nextUp="ရေတစ်ခွက်" actions={actions} />
      </main>
      <BottomNavigation />
      <BottomSheet open={open} title="ရေတိုက်မယ်" onClose={() => setOpen(false)}>
        <div className="grid gap-4 py-1">
          <p className="text-3xl font-semibold">
            0 <span className="text-lg text-stone-500">/ 8 ခွက်</span>
          </p>
          <p className="text-sm text-stone-500">250 ml / ခွက်</p>
          <div className="h-3 rounded-full bg-stone-200">
            <div className="h-full w-0 rounded-full bg-[#75a7a0]" />
          </div>
          <button type="button" className="min-h-12 rounded-full bg-stone-900 text-white">
            + ရေတစ်ခွက်
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
