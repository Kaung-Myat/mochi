import Link from "next/link";
import { NotificationSettings } from "@/components/reminders/notification-settings";

export default function NotificationSettingsPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-10 pb-28">
      <Link className="text-sm underline" href="/settings">
        ဆက်တင်သို့ ပြန်သွားမယ်
      </Link>
      <p className="mt-6 text-sm font-medium tracking-wide text-stone-600">MOCHI</p>
      <h1 className="mt-3 text-4xl font-semibold">သတိပေးချက်များ</h1>
      <NotificationSettings />
    </main>
  );
}
