import { MochiMascot } from "@/components/mascot/mochi-mascot";

export default function OfflinePage() {
  return (
    <main className="auth-game-page mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      <MochiMascot className="w-48" />
      <h1 className="mt-3 text-2xl font-semibold">Mochi လမ်းပျောက်နေတယ်</h1>
      <p className="mt-3 max-w-sm text-sm text-stone-700">
        အင်တာနက်ပြန်ရတာနဲ့ Mochi က အလိုအလျောက် ပြန်ချိတ်ပေးမယ်။ မင်းရဲ့ ကိုယ်ရေးအချက်အလက်တွေကို
        တခြားသူနဲ့မျှသုံးတဲ့ cache ကနေ ဘယ်တော့မှ မပြပါဘူး။
      </p>
    </main>
  );
}
