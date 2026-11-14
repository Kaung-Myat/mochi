import Link from "next/link";
import { MochiMascot } from "@/components/mascot/mochi-mascot";
import { NotificationSettings } from "@/components/reminders/notification-settings";

export default function NotificationSettingsPage() {
  return (
    <main className="settings-page mx-auto min-h-dvh max-w-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="relative overflow-hidden rounded-[1.5rem] border-[3px] border-white bg-[#fff7ee] px-3 pt-3 pb-2.5 shadow-[0_6px_0_#f0c9a8]">
        <div className="relative z-10 flex items-start gap-2.5">
          <Link
            href="/settings"
            aria-label="Back to settings"
            className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-white bg-[#7ec8f8] text-[#1d6f9a] shadow-[0_3px_0_#5fb4e8] active:translate-y-0.5 active:shadow-none"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1 pr-14">
            <p className="text-[0.62rem] font-bold tracking-[0.14em] text-[#1d6f9a]">ALERTS</p>
            <h1 className="mt-0.5 text-xl font-semibold text-[#3a2a24]">သတိပေးချက်</h1>
            <p className="mt-1 text-[0.78rem] text-stone-600">Mochi က ဘယ်အချိန်မှာ လာခေါ်ပေးရမလဲ</p>
          </div>
        </div>
        <MochiMascot className="pointer-events-none absolute -right-1 -bottom-3 w-[4.6rem]" />
      </header>
      <NotificationSettings />
    </main>
  );
}
