"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
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
    <div className="mt-7 grid gap-5">
      <section className="rounded-3xl bg-[#f4dfd4] p-5">
        <h2 className="text-xl font-semibold">မင်းတစ်ယောက်တည်းအတွက် မှတ်စုလေး</h2>
        <p className="mt-2 text-sm text-stone-700">
          Mochi က မှတ်ထားပေးတာပါ။ ရောဂါရှာဖွေခြင်း သို့မဟုတ် ဆေးဘက်ဆိုင်ရာ အကြံပေးခြင်း မဟုတ်ပါ။
        </p>
      </section>

      <Link
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-900 px-5 text-white"
        href="/tummy/new"
      >
        + အခြေအနေအသစ် မှတ်မယ်
      </Link>

      <section className="rounded-3xl border border-stone-200 bg-white/70 p-5">
        <h2 className="text-xl font-semibold">မှတ်စုများ</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm">
            အချိန်ကာလ
            <select
              className="min-h-12 rounded-xl border border-stone-300 bg-white px-3"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as DateFilter)}
            >
              <option value="7">လွန်ခဲ့တဲ့ 7 ရက်</option>
              <option value="30">လွန်ခဲ့တဲ့ 30 ရက်</option>
              <option value="all">အားလုံး</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            လက္ခဏာ
            <select
              className="min-h-12 rounded-xl border border-stone-300 bg-white px-3"
              value={symptomFilter}
              onChange={(event) => setSymptomFilter(event.target.value as Symptom | "all")}
            >
              <option value="all">အားလုံး</option>
              {symptomValues.map((symptom) => (
                <option key={symptom} value={symptom}>
                  {symptomLabels[symptom]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-4 text-sm text-stone-600">
          ရွေးထားတဲ့အတွင်း မှတ်စု {filteredEntries.length} ခုရှိပါတယ်။ ဒါဟာ
          အရေအတွက်မှတ်တမ်းသာဖြစ်ပြီး အကြောင်းရင်းဆိုင်ရာ သုံးသပ်ချက် မဟုတ်ပါဘူး။
        </p>
      </section>

      {syncing && <p className="text-sm text-stone-500">မှတ်စုလေးတွေ သိမ်းနေတယ်…</p>}
      {error && (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {loading && (
        <p className="text-stone-600" role="status">
          မှတ်စုတွေ ဖွင့်နေတယ်…
        </p>
      )}

      {!loading && filteredEntries.length === 0 && (
        <section className="rounded-3xl border border-dashed border-stone-300 p-6 text-center">
          <p className="text-3xl" aria-hidden="true">
            ♡
          </p>
          <h2 className="mt-3 text-xl font-semibold">ဒီနေရာလေးက ငြိမ်ငြိမ်လေးပါ</h2>
          <p className="mt-2 text-stone-600">
            မှတ်ချင်တဲ့အချိန်မှ စိတ်အေးအေးနဲ့ ရေးထားလို့ရပါတယ်နော်။
          </p>
        </section>
      )}

      {filteredEntries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          deleting={deleting === entry.id}
          onDelete={() => void remove(entry)}
        />
      ))}

      <aside className="rounded-3xl border border-stone-300 bg-white/70 p-5 text-sm text-stone-700">
        <h2 className="font-semibold">ကိုယ့်ကိုယ်ကို ဂရုစိုက်ပေးနော်</h2>
        <p className="mt-2">
          ရုတ်တရက်ပြင်းထန်တာ၊ ကြာရှည်မပျောက်တာ သို့မဟုတ် စိုးရိမ်ရတဲ့လက္ခဏာရှိရင် အရည်အချင်းရှိတဲ့
          ကျန်းမာရေးပညာရှင်နဲ့ တိုင်ပင်သင့်ပါတယ်။ အရေးပေါ်အခြေအနေဖြစ်တယ်လို့ ယူဆရင်
          ဒေသခံအရေးပေါ်ဝန်ဆောင်မှုကို ဆက်သွယ်ပါ။
        </p>
      </aside>
    </div>
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
    <article className="rounded-3xl border border-stone-200 bg-white/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <time className="text-sm text-stone-500" dateTime={entry.occurredAt.toISOString()}>
            {formattedDate}
          </time>
          <h2 className="mt-1 text-xl font-semibold">မသက်မသာအဆင့် {entry.intensity} / 10</h2>
        </div>
        <span className="rounded-full bg-[#f4dfd4] px-3 py-1 text-sm">ကိုယ်ပိုင်</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {entry.symptoms.map((symptom) => (
          <span key={symptom} className="rounded-full border border-stone-300 px-3 py-1 text-sm">
            {symptomLabels[symptom]}
          </span>
        ))}
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-stone-700">
        {entry.location && <Detail label="နေရာ" value={locationLabels[entry.location]} />}
        {entry.durationMinutes && (
          <Detail label="ကြာချိန်" value={`${entry.durationMinutes} မိနစ်`} />
        )}
        {entry.mealRelation && (
          <Detail label="စားချိန်နဲ့ဆက်စပ်မှု" value={mealRelationLabels[entry.mealRelation]} />
        )}
        {entry.moodOrEnergy && <Detail label="စိတ်ခံစားမှု / အားအင်" value={entry.moodOrEnergy} />}
      </dl>
      {entry.note && (
        <p className="mt-4 rounded-2xl bg-[#fffaf3] p-4 text-sm whitespace-pre-wrap">
          {entry.note}
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <Link
          className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-4"
          href={`/tummy/${entry.id}/edit`}
        >
          ပြန်ပြင်မယ်
        </Link>
        <button
          className="min-h-11 px-4 text-sm text-red-800 disabled:opacity-50"
          disabled={deleting}
          onClick={onDelete}
        >
          {deleting ? "ဖျက်နေတယ်…" : "ဖျက်မယ်"}
        </button>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2">
      <dt className="text-stone-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
