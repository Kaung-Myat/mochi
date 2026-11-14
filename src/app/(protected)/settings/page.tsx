import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { GameSettingsPanel } from "@/components/game/game-settings-panel";
import { MochiMascot } from "@/components/mascot/mochi-mascot";

export default function SettingsPage() {
  return (
    <main className="settings-page mx-auto min-h-dvh max-w-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="relative overflow-hidden rounded-[1.5rem] border-[3px] border-white bg-[#fff7ee] px-3.5 pt-3.5 pb-3 shadow-[0_6px_0_#f0c9a8]">
        <div className="relative z-10 max-w-[72%]">
          <p className="text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">MOCHI LAB</p>
          <h1 className="mt-0.5 text-xl font-semibold text-[#3a2a24]">ပြင်ဆင်စရာများ</h1>
          <p className="mt-1 text-[0.78rem] text-stone-600">
            အသံ၊ သတိပေးချက်နဲ့ ကိုယ်ရေးအချက်အလက်တွေကို ဒီမှာ ချိန်မယ်။
          </p>
        </div>
        <MochiMascot className="pointer-events-none absolute -right-1 -bottom-3 w-[4.8rem]" />
      </header>

      <div className="mt-4 grid gap-3">
        <GameSettingsPanel />

        <Link
          href="/settings/notifications"
          className="flex items-center gap-3 rounded-[1.5rem] border-[3px] border-white bg-white/90 p-3.5 shadow-[0_5px_0_#f0c9a8] active:translate-y-0.5 active:shadow-[0_3px_0_#f0c9a8]"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#7ec8f8] text-[#1d6f9a] shadow-[0_3px_0_#5fb4e8]">
            <BellIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.62rem] font-bold tracking-[0.14em] text-[#1d6f9a]">
              ALERTS
            </span>
            <span className="block text-base font-semibold text-[#3a2a24]">Mochi ရဲ့ စာပို့သံ</span>
            <span className="block text-[0.72rem] text-stone-500">
              ဒီစက် + သတိပေးချိန်တွေ ပြင်မယ်
            </span>
          </span>
          <span className="text-[#c45a3c]" aria-hidden="true">
            ›
          </span>
        </Link>

        <Link
          href="/onboarding"
          className="flex items-center gap-3 rounded-[1.5rem] border-[3px] border-white bg-white/90 p-3.5 shadow-[0_5px_0_#f0c9a8] active:translate-y-0.5 active:shadow-[0_3px_0_#f0c9a8]"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#ffd15c] text-[#3a2a24] shadow-[0_3px_0_#e2b000]">
            <ProfileIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">
              PROFILE
            </span>
            <span className="block text-base font-semibold text-[#3a2a24]">မင်းနဲ့ Mochi</span>
            <span className="block text-[0.72rem] text-stone-500">နာမည်နဲ့ အချိန်ဇုန် ပြန်ပြင်မယ်</span>
          </span>
          <span className="text-[#c45a3c]" aria-hidden="true">
            ›
          </span>
        </Link>

        <div className="rounded-[1.5rem] border-[3px] border-white bg-white/90 p-4 shadow-[0_5px_0_#f0c9a8]">
          <p className="mb-2 text-[0.62rem] font-bold tracking-[0.14em] text-stone-400">ACCOUNT</p>
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.8-3.2 4-4.5 7-4.5s5.2 1.3 7 4.5" />
    </svg>
  );
}
