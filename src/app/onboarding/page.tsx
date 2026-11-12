"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuthState } from "@/components/auth/auth-provider";
import { MochiMascot } from "@/components/mascot/mochi-mascot";
import { saveProfile } from "@/lib/profile/repository";
import { detectTimezone } from "@/lib/profile/schema";

const storageKey = "mochi:onboarding:v1";
type Draft = { displayName: string; timezone: string; reminderExplained: boolean };

function loadDraft(): Draft {
  if (typeof window === "undefined")
    return { displayName: "", timezone: detectTimezone(), reminderExplained: false };
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as Partial<Draft>;
    return {
      displayName: value.displayName ?? "",
      timezone: value.timezone ?? detectTimezone(),
      reminderExplained: value.reminderExplained ?? false,
    };
  } catch {
    return { displayName: "", timezone: detectTimezone(), reminderExplained: false };
  }
}

function OnboardingFlow() {
  const router = useRouter();
  const { user } = useAuthState();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft]);

  const messages = [
    "ဟေး… ငါက Mochi ပါ",
    "ရေသောက်ဖို့၊ အစာစားဖို့နဲ့ အိပ်ချိန်မှန်ဖို့ သတိပေးပေးမယ်နော်။",
    "မင်းတစ်ယောက်တည်းအတွက် တစ်ယောက်ယောက်က ငါ့ကို ဖန်တီးပေးထားတာပါ။",
  ];

  async function complete() {
    if (!user) return;
    setError(null);
    setIsSaving(true);
    try {
      await saveProfile(user.uid, {
        displayName: draft.displayName.trim() || undefined,
        timezone: draft.timezone.trim(),
        locale: "my",
        onboardingVersion: 1,
        onboardingCompletedAt: new Date(),
      });
      window.localStorage.removeItem(storageKey);
      router.replace("/today");
    } catch (saveError) {
      console.error("Could not save the onboarding profile", saveError);
      setError(
        "Mochi က ပြင်ဆင်ထားတာတွေကို မသိမ်းနိုင်သေးဘူး။ မင်းဖြည့်ထားတာတွေ ဒီစက်ထဲမှာရှိနေသေးလို့ စိတ်မပူနဲ့နော်—ထပ်စမ်းကြည့်ပေးပါ။",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="onboarding-game-page mx-auto flex min-h-dvh max-w-md flex-col px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-bold tracking-wider text-rose-800/60">
            MOCHI ရဲ့ ပထမဆုံး QUEST
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full rounded-full bg-rose-500 transition-[width]"
              style={{ width: `${((step + 1) / 5) * 100}%` }}
            />
          </div>
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-rose-900">
          {step + 1} / 5
        </span>
      </div>
      <MochiMascot className="mochi-idle mx-auto -my-1 w-36" />
      <div className="flex flex-1 flex-col rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_20px_50px_rgba(80,45,40,0.1)] backdrop-blur">
        {step === 0 && (
          <section className="my-auto text-center">
            <h1 className="text-3xl font-semibold">{messages[0]}</h1>
            <p className="mt-5 leading-7 text-stone-700">{messages[1]}</p>
            <p className="mt-4 leading-7 text-stone-700">{messages[2]}</p>
          </section>
        )}
        {step === 1 && (
          <section className="my-auto">
            <h1 className="text-3xl font-semibold">မင်းရဲ့ ကိုယ်ရေးကိုယ်တာက အရေးအကြီးဆုံးပါ</h1>
            <p className="mt-5 leading-7 text-stone-700">
              မင်းရွေးထားတဲ့ နေ့စဉ်အစီအစဉ်နဲ့ မှတ်စုတွေကို မင်းရဲ့အကောင့်ထဲမှာပဲ Mochi က
              သိမ်းပေးထားမယ်။ ဗိုက်အခြေအနေမှတ်စုဟာ ကိုယ်ပိုင်မှတ်တမ်းသာဖြစ်ပြီး
              ဆေးဘက်ဆိုင်ရာအကြံဉာဏ် သို့မဟုတ် ရောဂါသတ်မှတ်ချက် မဟုတ်ပါဘူး။
            </p>
          </section>
        )}
        {step === 2 && (
          <section className="my-auto">
            <h1 className="text-3xl font-semibold">Mochi က မင်းကို ဘယ်လိုခေါ်ရမလဲ?</h1>
            <label className="mt-6 grid gap-2">
              ချစ်စနိုးနာမည်{" "}
              <input
                className="min-h-11 rounded-2xl border border-rose-200 bg-white px-4"
                value={draft.displayName}
                maxLength={40}
                onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
                placeholder="မထည့်လည်း ရပါတယ်"
              />
            </label>
            <p className="mt-3 text-sm text-stone-600">
              ကျော်သွားလို့ရသလို နောက်မှလည်း ပြန်ပြောင်းနိုင်ပါတယ်။
            </p>
          </section>
        )}
        {step === 3 && (
          <section className="my-auto">
            <h1 className="text-3xl font-semibold">မင်းရှိရာဒေသရဲ့ အချိန်</h1>
            <label className="mt-6 grid gap-2">
              အချိန်ဇုန်{" "}
              <input
                className="min-h-11 rounded-2xl border border-rose-200 bg-white px-4"
                value={draft.timezone}
                onChange={(event) => setDraft({ ...draft, timezone: event.target.value })}
                required
                aria-describedby="timezone-help"
              />
            </label>
            <p id="timezone-help" className="mt-3 text-sm leading-6 text-stone-600">
              ဒီစက်ကနေ အလိုအလျောက်ရှာထားတာပါ။ ဆက်မသွားခင် မှန်မမှန်တစ်ချက်စစ်ပေးနော်။
            </p>
          </section>
        )}
        {step === 4 && (
          <section className="my-auto">
            <h1 className="text-3xl font-semibold">နူးညံ့တဲ့ သတိပေးချက်လေးတွေ—မင်းစိတ်ကြိုက်</h1>
            <p className="mt-5 leading-7 text-stone-700">
              သတိပေးချက်ဖွင့်ဖို့ မင်းရွေးချယ်မှသာ Mochi က notification ခွင့်ပြုချက်တောင်းမယ်။
              Notification မဖွင့်ဘဲလည်း app ကိုသုံးလို့ရပြီး စိတ်ပြောင်းရင်
              အချိန်မရွေးပြင်နိုင်ပါတယ်။
            </p>
            <label className="mt-6 flex items-start gap-3">
              <input
                className="mt-1 size-5"
                type="checkbox"
                checked={draft.reminderExplained}
                onChange={(event) =>
                  setDraft({ ...draft, reminderExplained: event.target.checked })
                }
              />
              <span>သတိပေးချက်ခွင့်ပြုတာက မဖြစ်မနေမဟုတ်ကြောင်း နားလည်ပါတယ်။</span>
            </label>
          </section>
        )}
        {error && (
          <p className="mt-5 text-sm text-red-800" role="alert">
            {error}
          </p>
        )}
        <div className="mt-auto flex gap-3 pt-6">
          {step > 0 && (
            <button
              className="min-h-11 rounded-full border border-rose-300 bg-white px-5 py-3 font-semibold text-rose-900"
              type="button"
              onClick={() => setStep(step - 1)}
            >
              နောက်သို့
            </button>
          )}
          {step < 4 ? (
            <button
              className="min-h-11 flex-1 rounded-full bg-rose-600 px-5 py-3 font-semibold text-white shadow-lg"
              type="button"
              onClick={() => setStep(step + 1)}
            >
              ဆက်သွားမယ်
            </button>
          ) : (
            <button
              className="min-h-11 flex-1 rounded-full bg-rose-600 px-5 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
              type="button"
              disabled={!draft.reminderExplained || isSaving}
              onClick={complete}
            >
              {isSaving ? "သိမ်းနေတယ်…" : "ပြင်ဆင်မှု ပြီးပါပြီ"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <RequireAuth>
      <OnboardingFlow />
    </RequireAuth>
  );
}
