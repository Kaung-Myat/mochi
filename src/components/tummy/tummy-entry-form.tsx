"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
import { detectTimezone } from "@/lib/profile/schema";
import { saveTummyEntry, subscribeTummyEntry } from "@/lib/tummy/repository";
import {
  locationLabels,
  mealRelationLabels,
  symptomLabels,
  symptomValues,
  type MealRelation,
  type Symptom,
  type TummyEntry,
  type TummyLocation,
} from "@/lib/tummy/schema";

function toLocalDateTime(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

interface Draft {
  occurredAt: string;
  intensity: number;
  symptoms: Symptom[];
  location: TummyLocation | "";
  durationMinutes: string;
  mealRelation: MealRelation | "";
  moodOrEnergy: string;
  note: string;
}

const emptyDraft = (): Draft => ({
  occurredAt: toLocalDateTime(new Date()),
  intensity: 0,
  symptoms: [],
  location: "",
  durationMinutes: "",
  mealRelation: "",
  moodOrEnergy: "",
  note: "",
});

function draftFromEntry(entry: TummyEntry): Draft {
  return {
    occurredAt: toLocalDateTime(entry.occurredAt),
    intensity: entry.intensity,
    symptoms: entry.symptoms,
    location: entry.location ?? "",
    durationMinutes: entry.durationMinutes?.toString() ?? "",
    mealRelation: entry.mealRelation ?? "",
    moodOrEnergy: entry.moodOrEnergy ?? "",
    note: entry.note ?? "",
  };
}

export function TummyEntryForm({ entryId }: { entryId?: string }) {
  const router = useRouter();
  const { user } = useAuthState();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(Boolean(entryId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entryId || !user) return;
    return subscribeTummyEntry(
      user.uid,
      entryId,
      (entry) => {
        if (entry) setDraft(draftFromEntry(entry));
        else setError("ဒီမှတ်စုကို မတွေ့တော့ပါဘူး။");
        setLoading(false);
      },
      (loadError) => {
        console.error("Could not load tummy entry", loadError);
        setError("မှတ်စုကို မဖွင့်နိုင်သေးဘူး။ အင်တာနက်စစ်ပြီး ပြန်စမ်းကြည့်ပေးနော်။");
        setLoading(false);
      },
    );
  }, [entryId, user]);

  function toggleSymptom(symptom: Symptom) {
    setDraft((current) => ({
      ...current,
      symptoms: current.symptoms.includes(symptom)
        ? current.symptoms.filter((value) => value !== symptom)
        : [...current.symptoms, symptom],
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    if (draft.symptoms.length === 0) {
      setError("ခံစားနေရတဲ့ လက္ခဏာ အနည်းဆုံးတစ်ခု ရွေးပေးနော်။");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveTummyEntry(
        user.uid,
        {
          occurredAt: new Date(draft.occurredAt),
          timezone: detectTimezone(),
          intensity: draft.intensity,
          symptoms: draft.symptoms,
          location: draft.location || undefined,
          durationMinutes: draft.durationMinutes ? Number(draft.durationMinutes) : undefined,
          mealRelation: draft.mealRelation || undefined,
          moodOrEnergy: draft.moodOrEnergy.trim() || undefined,
          note: draft.note.trim() || undefined,
        },
        entryId,
      );
      router.replace("/tummy");
    } catch (saveError) {
      console.error("Could not save tummy entry", saveError);
      setError("မှတ်စုကို မသိမ်းနိုင်သေးဘူး။ ဖြည့်ထားတာတွေ မပျောက်ပါဘူး—ထပ်စမ်းကြည့်ပေးနော်။");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="mt-8 text-stone-600">မှတ်စုကို ဖွင့်နေတယ်…</p>;

  return (
    <form className="mt-7 grid gap-6" onSubmit={submit}>
      <div className="rounded-2xl bg-[#f4dfd4] p-4 text-sm text-stone-700">
        Mochi က မှတ်ထားပေးတာပါ။ ရောဂါရှာဖွေခြင်း သို့မဟုတ် ဆေးဘက်ဆိုင်ရာ အကြံပေးခြင်း မဟုတ်ပါ။
      </div>

      <label className="grid gap-2">
        ဖြစ်ခဲ့တဲ့ ရက်စွဲနဲ့အချိန်
        <input
          className="min-h-12 rounded-xl border border-stone-300 bg-white px-3"
          type="datetime-local"
          value={draft.occurredAt}
          max={toLocalDateTime(new Date())}
          required
          onChange={(event) => setDraft({ ...draft, occurredAt: event.target.value })}
        />
      </label>

      <fieldset className="rounded-3xl border border-stone-200 bg-white/70 p-5">
        <legend className="px-2 font-semibold">အခုခံစားရတဲ့ မသက်မသာအဆင့်</legend>
        <p className="mt-2 text-sm text-stone-600">
          0 က လုံးဝမရှိတာ၊ 10 က ကိုယ်တိုင်ခံစားရသလောက် အများဆုံးကို ဆိုလိုပါတယ်။ ဒါဟာ
          ရောဂါသတ်မှတ်ချက် မဟုတ်ပါဘူး။
        </p>
        <div className="mt-4 flex items-center gap-4">
          <input
            className="min-h-11 flex-1 accent-[#bf705d]"
            type="range"
            min={0}
            max={10}
            step={1}
            value={draft.intensity}
            aria-label="မသက်မသာခံစားရမှု အဆင့်"
            onChange={(event) =>
              setDraft({ ...draft, intensity: event.currentTarget.valueAsNumber })
            }
          />
          <output className="min-w-12 rounded-full bg-stone-900 px-3 py-1 text-center text-white">
            {draft.intensity}
          </output>
        </div>
      </fieldset>

      <fieldset className="rounded-3xl border border-stone-200 bg-white/70 p-5">
        <legend className="px-2 font-semibold">ဘယ်လိုခံစားနေရလဲ?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {symptomValues.map((symptom) => (
            <label
              key={symptom}
              className="flex min-h-11 items-center gap-3 rounded-xl bg-[#fffaf3] px-3"
            >
              <input
                type="checkbox"
                checked={draft.symptoms.includes(symptom)}
                onChange={() => toggleSymptom(symptom)}
              />
              {symptomLabels[symptom]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 rounded-3xl border border-stone-200 bg-white/70 p-5 sm:grid-cols-2">
        <label className="grid gap-2">
          ခံစားရတဲ့နေရာ (မထည့်လည်းရပါတယ်)
          <select
            className="min-h-12 rounded-xl border border-stone-300 bg-white px-3"
            value={draft.location}
            onChange={(event) =>
              setDraft({ ...draft, location: event.target.value as TummyLocation | "" })
            }
          >
            <option value="">မရွေးထားပါ</option>
            {Object.entries(locationLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          ကြာချိန် မိနစ် (မထည့်လည်းရပါတယ်)
          <input
            className="min-h-12 rounded-xl border border-stone-300 bg-white px-3"
            type="number"
            min={1}
            max={10080}
            value={draft.durationMinutes}
            onChange={(event) => setDraft({ ...draft, durationMinutes: event.target.value })}
          />
        </label>
        <label className="grid gap-2">
          စားချိန်နဲ့ဆက်စပ်မှု (မထည့်လည်းရပါတယ်)
          <select
            className="min-h-12 rounded-xl border border-stone-300 bg-white px-3"
            value={draft.mealRelation}
            onChange={(event) =>
              setDraft({ ...draft, mealRelation: event.target.value as MealRelation | "" })
            }
          >
            <option value="">မရွေးထားပါ</option>
            {Object.entries(mealRelationLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          စိတ်ခံစားမှု / အားအင် (မထည့်လည်းရပါတယ်)
          <input
            className="min-h-12 rounded-xl border border-stone-300 bg-white px-3"
            maxLength={40}
            value={draft.moodOrEnergy}
            onChange={(event) => setDraft({ ...draft, moodOrEnergy: event.target.value })}
            placeholder="ဥပမာ—ပင်ပန်းနေတယ်"
          />
        </label>
      </div>

      <label className="grid gap-2">
        ကိုယ်ပိုင်မှတ်စု (မထည့်လည်းရပါတယ်)
        <textarea
          className="min-h-32 rounded-2xl border border-stone-300 bg-white p-3"
          maxLength={500}
          value={draft.note}
          onChange={(event) => setDraft({ ...draft, note: event.target.value })}
        />
        <span className="text-right text-xs text-stone-500">{draft.note.length} / 500</span>
      </label>

      {error && (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Link
          className="inline-flex min-h-12 items-center rounded-full border border-stone-300 px-5"
          href="/tummy"
        >
          မသိမ်းတော့ပါ
        </Link>
        <button
          className="min-h-12 flex-1 rounded-full bg-stone-900 px-5 text-white disabled:opacity-50"
          disabled={saving}
        >
          {saving ? "သိမ်းနေတယ်…" : entryId ? "ပြောင်းလဲမှုတွေ သိမ်းမယ်" : "မှတ်ထားမယ်"}
        </button>
      </div>
    </form>
  );
}
