import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { GamePageHeader } from "@/components/layout/game-page-header";
import { GameSettingsPanel } from "@/components/game/game-settings-panel";

export default function SettingsPage() {
  return (
    <main className="game-page mx-auto min-h-dvh max-w-md px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <GamePageHeader
        eyebrow="MOCHI LAB"
        title="ပြင်ဆင်စရာများ"
        description="ဂိမ်းခံစားမှုနဲ့ သတိပေးချက်တွေကို ဒီမှာ ချိန်နိုင်တယ်။"
      />
      <div className="mt-5 grid gap-3">
        <GameSettingsPanel />
        <Link
          className="game-menu-link rounded-[1.6rem] border-[3px] border-white bg-white/80 p-5 shadow-[0_6px_0_#d7eefb]"
          href="/settings/notifications"
        >
          <span className="block text-[0.62rem] font-bold tracking-[0.14em] text-[#1d6f9a]">
            ALERTS
          </span>
          <span className="mt-0.5 block font-semibold text-[#3a2a24]">Mochi ရဲ့ စာပို့သံ</span>
          <span className="block text-sm text-stone-500">သတိပေးချက်အချိန်တွေ ပြင်မယ်</span>
        </Link>
        <Link
          className="game-menu-link rounded-[1.6rem] border-[3px] border-white bg-white/80 p-5 shadow-[0_6px_0_#d7eefb]"
          href="/onboarding"
        >
          <span className="block text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">
            PROFILE
          </span>
          <span className="mt-0.5 block font-semibold text-[#3a2a24]">မင်းနဲ့ Mochi</span>
          <span className="block text-sm text-stone-500">နာမည်နဲ့ အချိန်ဇုန် ပြန်ပြင်မယ်</span>
        </Link>
        <div className="rounded-[1.6rem] border-[3px] border-white bg-white/80 p-5 shadow-[0_6px_0_#d7eefb]">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
