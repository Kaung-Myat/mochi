"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
import { MochiMascot } from "@/components/mascot/mochi-mascot";
import { removeTummyEntry, subscribeTummyEntries } from "@/lib/tummy/repository";
import {
  locationLabels,
  mealRelationLabels,
  symptomLabels,
  symptomValues,
  type Symptom,
  type TummyEntry,
} from "@/lib/tummy/schema";

type DateFilter = "all" | "7" | "30";

export function TummyJournal() {
  const { user } = useAuthState();
  const [entries, setEntries] = useState<TummyEntry[]>([]);
  const [referenceTime] = useState(() => Date.now());
  const [dateFilter, setDateFilter] = useState<DateFilter>("30");
  const [symptomFilter, setSymptomFilter] = useState<Symptom | "all">("all");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeTummyEntries(
      user.uid,
      (values, pending) => {
        setEntries(values);
        setSyncing(pending);
        setLoading(false);
      },
      (loadError) => {
        console.error("Could not load tummy journal", loadError);
        setError("မှတ်စုတွေကို မဖွင့်နိုင်သေးဘူး။ အင်တာနက်စစ်ပြီး ထပ်စမ်းကြည့်ပေးနော်။");
        setLoading(false);
      },
    );
  }, [user]);

  const filteredEntries = useMemo(() => {
    const cutoff = dateFilter === "all" ? null : referenceTime - Number(dateFilter) * 86_400_000;
    return entries.filter(
      (entry) =>
        (!cutoff || entry.occurredAt.getTime() >= cutoff) &&
        (symptomFilter === "all" || entry.symptoms.includes(symptomFilter)),
    );
  }, [dateFilter, entries, referenceTime, symptomFilter]);

  async function remove(entry: TummyEntry) {
    if (!user) return;
    if (!window.confirm("ဒီမှတ်စုကို အပြီးဖျက်မှာ သေချာလား? ပြန်ယူလို့မရတော့ပါဘူး။")) return;
    setDeleting(entry.id);
    setError(null);
    try {
      await removeTummyEntry(user.uid, entry.id);
    } catch (deleteError) {
      console.error("Could not delete tummy entry", deleteError);
      setError("မှတ်စုကို မဖျက်နိုင်သေးဘူး။ ထပ်စမ်းကြည့်ပေးနော်။");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="grid gap-4">
      <header className="relative overflow-hidden rounded-[1.8rem] border-4 border-white bg-[#fff7ee] px-4 pt-4 pb-3 shadow-[0_8px_0_#f0c9a8]">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold tracking-[0.14em] text-[#c45a3c]">SECRET DIARY</p>
            <h1 className="mt-0.5 text-2xl font-semibold text-[#3a2a24]">ဗိုက်လေးမှတ်စု</h1>
            <p className="mt-1 text-sm text-stone-600">Mochi တစ်ယောက်တည်းသိတဲ့ မှတ်စုလေး</p>
          </div>
          <MochiMascot className="w-16 shrink-0" />
        </div>
        <Link
          href="/tummy/new"
          className="relative z-10 mt-3 flex min-h-12 items-center justify-center rounded-full bg-[#7a45f5] px-5 font-semibold text-white shadow-[0_4px_0_#4520aa]"
        >
          + Diary အသစ် ရေးမယ်
        </Link>
      </header>

      <section className="grid gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(
            [
              ["7", "7 ရက်"],
              ["30", "30 ရက်"],
              ["all", "အားလုံး"],
            ] as const
          ).map(([value, label]) => (
            <Chip
              key={value}
              active={dateFilter === value}
              onClick={() => setDateFilter(value)}
              label={label}
            />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip
            active={symptomFilter === "all"}
            onClick={() => setSymptomFilter("all")}
            label="လက္ခဏာအားလုံး"
          />
          {symptomValues.map((symptom) => (
            <Chip
              key={symptom}
              active={symptomFilter === symptom}
              onClick={() => setSymptomFilter(symptom)}
              label={symptomLabels[symptom]}
            />
          ))}
        </div>
        <p className="px-1 text-xs text-stone-500">
          {filteredEntries.length} ခု · အရေအတွက်သာ · ရောဂါရှာဖွေခြင်း မဟုတ်ပါ
        </p>
      </section>

      {syncing && <p className="text-sm text-stone-500">မှတ်စုလေးတွေ သိမ်းနေတယ်…</p>}
      {error && (
        <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </p>
      )}
      {loading && (
        <p className="text-stone-600" role="status">
          မှတ်စုတွေ ဖွင့်နေတယ်…
        </p>
      )}

      {!loading && filteredEntries.length === 0 && (
        <section className="rounded-[1.6rem] border-4 border-dashed border-white bg-white/70 px-5 py-8 text-center shadow-[0_8px_0_#d7eefb]">
          <p className="text-lg font-semibold text-[#3a2a24]">diary လေးက ငြိမ်နေသေးတယ်</p>
          <p className="mt-1 text-sm text-stone-600">ရေးချင်တဲ့အခါမှ ဖြည်းဖြည်းလေး ရေးထားလို့ရပါတယ်။</p>
        </section>
      )}

      <div className="grid gap-3">
        {filteredEntries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            deleting={deleting === entry.id}
            onDelete={() => void remove(entry)}
          />
        ))}
      </div>

      <p className="px-1 pb-2 text-xs leading-relaxed text-stone-500">
        ပြင်းထန်တာ / ကြာရှည်မပျောက်တာရှိရင် ကျန်းမာရေးပညာရှင်နဲ့ တိုင်ပင်ပါ။ အရေးပေါ်ဆို
        ဒေသခံအရေးပေါ်ဝန်ဆောင်မှုကို ဆက်သွယ်ပါ။
      </p>
    </div>
  );
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? "border-[#7a45f5] bg-[#7a45f5] text-white shadow-[0_3px_0_#4520aa]"
          : "border-white bg-white/80 text-[#3a2a24] shadow-[0_3px_0_#d7eefb]"
      }`}
    >
      {label}
    </button>
  );
}

function EntryCard({
  entry,
  deleting,
  onDelete,
}: {
  entry: TummyEntry;
  deleting: boolean;
  onDelete: () => void;
}) {
  const formattedDate = new Intl.DateTimeFormat("my-MM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: entry.timezone,
  }).format(entry.occurredAt);

  return (
    <article className="rounded-[1.5rem] border-4 border-white bg-white p-4 shadow-[0_8px_0_#d7eefb]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <time className="text-xs text-stone-500" dateTime={entry.occurredAt.toISOString()}>
            {formattedDate}
          </time>
          <h2 className="text-lg font-semibold text-[#3a2a24]">မသက်မသာ {entry.intensity}/10</h2>
        </div>
        <div
          className="h-2.5 w-20 shrink-0 overflow-hidden rounded-full bg-stone-200"
          role="meter"
          aria-label="မသက်မသာအဆင့်"
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={entry.intensity}
        >
          <div
            className="h-full rounded-full bg-[#f07828]"
            style={{ width: `${entry.intensity * 10}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {entry.symptoms.map((symptom) => (
          <span
            key={symptom}
            className="rounded-full bg-[#fff0e4] px-2.5 py-1 text-xs font-medium text-[#8a4a28]"
          >
            {symptomLabels[symptom]}
          </span>
        ))}
      </div>

      {(entry.location || entry.durationMinutes || entry.mealRelation || entry.moodOrEnergy) && (
        <dl className="mt-3 grid gap-1 text-sm text-stone-700">
          {entry.location && <Detail label="နေရာ" value={locationLabels[entry.location]} />}
          {entry.durationMinutes != null && (
            <Detail label="ကြာချိန်" value={`${entry.durationMinutes} မိနစ်`} />
          )}
          {entry.mealRelation && (
            <Detail label="စားချိန်" value={mealRelationLabels[entry.mealRelation]} />
          )}
          {entry.moodOrEnergy && <Detail label="စိတ် / အား" value={entry.moodOrEnergy} />}
        </dl>
      )}

      {entry.note && (
        <p className="mt-3 rounded-2xl bg-[#fffaf3] px-3 py-2 text-sm whitespace-pre-wrap text-stone-700">
          {entry.note}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <Link
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border-2 border-stone-200 bg-[#fffaf5] px-4 text-sm font-semibold"
          href={`/tummy/${entry.id}/edit`}
        >
          ပြန်ပြင်
        </Link>
        <button
          type="button"
          className="min-h-10 rounded-full px-4 text-sm font-semibold text-red-800 disabled:opacity-50"
          disabled={deleting}
          onClick={onDelete}
        >
          {deleting ? "ဖျက်နေ…" : "ဖျက်"}
        </button>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-2">
      <dt className="text-stone-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
