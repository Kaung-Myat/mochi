import Link from "next/link";
import { GamePageHeader } from "@/components/layout/game-page-header";
import { NotificationSettings } from "@/components/reminders/notification-settings";

export default function NotificationSettingsPage() {
  return (
    <main className="game-page mx-auto min-h-dvh max-w-md px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <Link
        className="mb-4 inline-flex min-h-10 items-center rounded-full bg-white/60 px-4 text-sm font-semibold text-rose-900"
        href="/settings"
      >
        ဆက်တင်သို့ ပြန်သွားမယ်
      </Link>
      <GamePageHeader
        eyebrow="MOCHI ရဲ့ စာပို့သံ"
        title="သတိပေးချက်"
        description="Mochi က ဘယ်အချိန်မှာ လာခေါ်ပေးရမလဲ ရွေးမယ်။"
      />
      <NotificationSettings />
    </main>
  );
}
