"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
import { useGameFeedback } from "@/components/game/game-feedback-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
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

function formatOccurredAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

type SheetId = "when" | "extras" | null;

export function TummyEntryForm({ entryId }: { entryId?: string }) {
  const router = useRouter();
  const { user } = useAuthState();
  const { play } = useGameFeedback();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(Boolean(entryId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetId>(null);

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

  const extrasSummary = useMemo(() => {
    const parts: string[] = [];
    if (draft.location) parts.push(locationLabels[draft.location]);
    if (draft.durationMinutes) parts.push(`${draft.durationMinutes} မိနစ်`);
    if (draft.mealRelation) parts.push(mealRelationLabels[draft.mealRelation]);
    if (draft.moodOrEnergy.trim()) parts.push(draft.moodOrEnergy.trim());
    if (draft.note.trim()) parts.push("မှတ်စု");
    return parts;
  }, [draft]);

  function toggleSymptom(symptom: Symptom) {
    play("select");
    setDraft((current) => ({
      ...current,
      symptoms: current.symptoms.includes(symptom)
        ? current.symptoms.filter((value) => value !== symptom)
        : [...current.symptoms, symptom],
    }));
  }

  function openSheet(next: SheetId) {
    setSheet(next);
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
      play("success");
      router.replace("/tummy");
    } catch (saveError) {
      console.error("Could not save tummy entry", saveError);
      setError("မှတ်စုကို မသိမ်းနိုင်သေးဘူး။ ဖြည့်ထားတာတွေ မပျောက်ပါဘူး—ထပ်စမ်းကြည့်ပေးနော်။");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="mt-6 text-center text-sm text-stone-600">မှတ်စုကို ဖွင့်နေတယ်…</p>;
  }

  return (
    <>
      <form className="diary-entry-form flex min-h-0 flex-1 flex-col" onSubmit={submit}>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-3">
          <p className="rounded-2xl bg-[#ffe8d8] px-3 py-2 text-[0.72rem] leading-snug text-[#6b4a3a]">
            Mochi က မှတ်ထားပေးတာပါ — ရောဂါရှာဖွေခြင်း / ဆေးအကြံ မဟုတ်ပါ။
          </p>

          <button
            type="button"
            onClick={() => openSheet("when")}
            className="diary-card flex w-full items-center justify-between gap-3 rounded-[1.35rem] border-[3px] border-white bg-white/90 px-3.5 py-3 text-left shadow-[0_5px_0_#f0c9a8] active:translate-y-0.5"
          >
            <div className="min-w-0">
              <p className="text-[0.68rem] font-bold tracking-wide text-[#c45a3c]">WHEN</p>
              <p className="truncate text-sm font-semibold text-[#3a2a24]">
                {formatOccurredAt(draft.occurredAt)}
              </p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ffe8d8] text-[#c45a3c]">
              <CalendarIcon />
            </span>
          </button>

          <section className="diary-card rounded-[1.35rem] border-[3px] border-white bg-white/90 p-3 shadow-[0_5px_0_#f0c9a8]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[#3a2a24]">မသက်မသာအဆင့်</h2>
              <output className="grid size-9 place-items-center rounded-full bg-[#3a2a24] text-sm font-bold text-white">
                {draft.intensity}
              </output>
            </div>
            <p className="mt-1 text-[0.68rem] text-stone-500">0 = မရှိ · 10 = အများဆုံး</p>
            <input
              className="mt-2 min-h-10 w-full accent-[#e07a55]"
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
          </section>

          <section className="diary-card rounded-[1.35rem] border-[3px] border-white bg-white/90 p-3 shadow-[0_5px_0_#f0c9a8]">
            <h2 className="text-sm font-semibold text-[#3a2a24]">ဘယ်လိုခံစားနေရလဲ?</h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {symptomValues.map((symptom) => {
                const active = draft.symptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleSymptom(symptom)}
                    className={`min-h-9 rounded-full border-2 px-3 text-[0.72rem] font-semibold transition active:scale-95 ${
                      active
                        ? "border-[#3a2a24] bg-[#ffd15c] text-[#3a2a24] shadow-[0_2px_0_#e2b000]"
                        : "border-[#f0d2bc] bg-[#fffaf3] text-[#6b5548]"
                    }`}
                  >
                    {symptomLabels[symptom]}
                  </button>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            onClick={() => openSheet("extras")}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-[#f0d2bc] bg-white/70 px-3.5 text-left active:scale-[0.99]"
          >
            <div className="min-w-0">
              <p className="text-[0.78rem] font-semibold text-[#6b5548]">အသေးစိတ် ထပ်ထည့်မယ်</p>
              <p className="truncate text-[0.68rem] text-stone-500">
                {extrasSummary.length > 0 ? extrasSummary.join(" · ") : "နေရာ၊ ကြာချိန်၊ မှတ်စု…"}
              </p>
            </div>
            <span aria-hidden="true" className="text-[#c45a3c]">
              ›
            </span>
          </button>

          {error && (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="relative z-10 -mx-4 mt-auto flex shrink-0 gap-2 border-t border-[#f0d2bc]/70 bg-[#fff4ea] px-4 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#3a2a24]/15 bg-white px-4 text-sm font-semibold text-[#3a2a24]"
            href="/tummy"
          >
            ပယ်မယ်
          </Link>
          <button
            className="min-h-11 flex-1 rounded-full bg-[#3a2a24] px-5 text-sm font-semibold text-white shadow-[0_4px_0_#1f1612] disabled:opacity-50 active:translate-y-0.5 active:shadow-none"
            disabled={saving}
          >
            {saving ? "သိမ်းနေတယ်…" : entryId ? "သိမ်းမယ်" : "မှတ်ထားမယ်"}
          </button>
        </div>
      </form>

      <BottomSheet
        open={sheet === "when"}
        title="ရက်စွဲနဲ့အချိန်"
        closeLabel="ပြီးပြီ"
        onClose={() => setSheet(null)}
      >
        <div className="grid gap-4 py-1">
          <p className="text-sm text-stone-600">ဖြစ်ခဲ့တဲ့အချိန်ကို ရွေးပေးနော်။</p>
          <input
            className="diary-input min-h-12 w-full rounded-2xl border-2 border-[#f0d2bc] bg-white px-3 text-base"
            type="datetime-local"
            value={draft.occurredAt}
            max={toLocalDateTime(new Date())}
            onChange={(event) => setDraft({ ...draft, occurredAt: event.target.value })}
          />
          <button
            type="button"
            className="min-h-11 rounded-full bg-[#3a2a24] text-sm font-semibold text-white"
            onClick={() => setSheet(null)}
          >
            ဒီအချိန်နဲ့ သုံးမယ်
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={sheet === "extras"}
        title="အသေးစိတ်"
        closeLabel="ပြီးပြီ"
        onClose={() => setSheet(null)}
      >
        <div className="grid gap-4 py-1">
          <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold text-[#3a2a24]">နေရာ</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(locationLabels) as TummyLocation[]).map((value) => {
                const active = draft.location === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      play("select");
                      setDraft({ ...draft, location: active ? "" : value });
                    }}
                    className={`min-h-9 rounded-full border-2 px-3 text-[0.72rem] font-semibold ${
                      active
                        ? "border-[#3a2a24] bg-[#ffd15c] text-[#3a2a24]"
                        : "border-[#f0d2bc] bg-white text-[#6b5548]"
                    }`}
                  >
                    {locationLabels[value]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-[#3a2a24]">ကြာချိန် (မိနစ်)</span>
            <input
              className="diary-input min-h-11 rounded-2xl border-2 border-[#f0d2bc] bg-white px-3"
              type="number"
              inputMode="numeric"
              min={1}
              max={10080}
              value={draft.durationMinutes}
              onChange={(event) => setDraft({ ...draft, durationMinutes: event.target.value })}
              placeholder="ဥပမာ—30"
            />
          </label>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold text-[#3a2a24]">စားချိန်နဲ့ဆက်စပ်မှု</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(mealRelationLabels) as MealRelation[]).map((value) => {
                const active = draft.mealRelation === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      play("select");
                      setDraft({ ...draft, mealRelation: active ? "" : value });
                    }}
                    className={`min-h-9 rounded-full border-2 px-3 text-[0.72rem] font-semibold ${
                      active
                        ? "border-[#3a2a24] bg-[#ffd15c] text-[#3a2a24]"
                        : "border-[#f0d2bc] bg-white text-[#6b5548]"
                    }`}
                  >
                    {mealRelationLabels[value]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-[#3a2a24]">စိတ် / အားအင်</span>
            <input
              className="diary-input min-h-11 rounded-2xl border-2 border-[#f0d2bc] bg-white px-3"
              maxLength={40}
              value={draft.moodOrEnergy}
              onChange={(event) => setDraft({ ...draft, moodOrEnergy: event.target.value })}
              placeholder="ပင်ပန်းနေတယ်…"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-[#3a2a24]">မှတ်စု</span>
            <textarea
              className="diary-input min-h-28 rounded-2xl border-2 border-[#f0d2bc] bg-white p-3"
              maxLength={500}
              value={draft.note}
              onChange={(event) => setDraft({ ...draft, note: event.target.value })}
              placeholder="လိုရင် တိုတိုလေး မှတ်ထား…"
            />
            <span className="text-right text-[0.62rem] text-stone-500">
              {draft.note.length} / 500
            </span>
          </label>

          <button
            type="button"
            className="min-h-11 rounded-full bg-[#3a2a24] text-sm font-semibold text-white"
            onClick={() => setSheet(null)}
          >
            ပြီးပြီ
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M7 3.5v3M17 3.5v3M4.5 9h15M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z" />
    </svg>
  );
}
