import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default function SettingsPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-10">
      <p className="text-sm font-medium tracking-wide text-stone-600">MOCHI</p>
      <h1 className="mt-3 text-4xl font-semibold">ဆက်တင်</h1>
      <div className="mt-8 grid gap-3">
        <Link
          className="rounded-2xl border border-stone-300 bg-white/70 p-4"
          href="/settings/notifications"
        >
          သတိပေးချက်များ
        </Link>
        <Link className="rounded-2xl border border-stone-300 bg-white/70 p-4" href="/onboarding">
          ကိုယ်ရေးအချက်အလက် ပြန်ကြည့်မယ်
        </Link>
        <div className="rounded-2xl border border-stone-300 bg-white/70 p-4">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
