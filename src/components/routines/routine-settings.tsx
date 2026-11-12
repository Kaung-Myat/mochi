"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
import {
  removeRoutine,
  saveRoutine,
  saveRoutines,
  subscribeRoutines,
} from "@/lib/routines/repository";
import {
  defaultHydrationRoutine,
  defaultMeals,
  defaultSleepRoutine,
  localizedRoutineLabel,
  type HydrationRoutine,
  type MealRoutine,
  type Routine,
  type SleepRoutine,
} from "@/lib/routines/schema";
import { sleepDurationMinutes } from "@/lib/routines/date";

function Status({ error, syncing }: { error: string | null; syncing: boolean }) {
  if (error)
    return (
      <p className="text-sm text-red-800" role="alert">
        {error}
      </p>
    );
  if (syncing)
    return (
      <p className="text-sm text-amber-800" role="status">
        ပြောင်းလဲထားတာတွေကို သိမ်းနေတယ်…
      </p>
    );
  return null;
}

export function RoutineSettings() {
  const { user } = useAuthState();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [hydration, setHydration] = useState(defaultHydrationRoutine);
  const [sleep, setSleep] = useState(defaultSleepRoutine);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const meals = useMemo(
    () =>
      routines
        .filter((routine): routine is MealRoutine => routine.type === "meal")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [routines],
  );

  useEffect(() => {
    if (!user) return;
    return subscribeRoutines(
      user.uid,
      (values, hasPendingWrites) => {
        setRoutines(values);
        setSyncing(hasPendingWrites);
        setHydration(
          values.find((value): value is HydrationRoutine => value.type === "hydration") ??
            defaultHydrationRoutine,
        );
        setSleep(
          values.find((value): value is SleepRoutine => value.type === "sleep") ??
            defaultSleepRoutine,
        );
        setLoading(false);
      },
      () => {
        setError(
          "နေ့စဉ်အစီအစဉ်တွေကို Mochi မဖွင့်နိုင်သေးဘူး။ အင်တာနက်စစ်ပြီး ထပ်စမ်းကြည့်ပေးနော်။",
        );
        setLoading(false);
      },
    );
  }, [user]);

  async function perform(label: string, action: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await action();
    } catch (actionError) {
      console.error("Routine update failed", actionError);
      setError("ဒီပြောင်းလဲမှုကို မသိမ်းနိုင်သေးဘူး။ ထပ်စမ်းကြည့်ပေးနော်။");
    } finally {
      setBusy(null);
    }
  }

  if (loading)
    return (
      <p className="mt-8 text-stone-600" role="status">
        နေ့စဉ်အစီအစဉ်တွေကို ဖွင့်နေတယ်…
      </p>
    );
  if (!user) return null;

  const hasSavedRoutines = routines.length > 0;
  const sleepMinutes = sleepDurationMinutes(sleep.bedtimeLocalTime, sleep.wakeLocalTime);

  return (
    <div className="mt-8 grid gap-6">
      {!hasSavedRoutines && (
        <section className="rounded-3xl bg-[#f4dfd4] p-6">
          <h2 className="text-xl font-semibold">နူးညံ့တဲ့ နမူနာအစီအစဉ်လေးတွေနဲ့ စမယ်</h2>
          <p className="mt-2 leading-6 text-stone-700">
            အားလုံးကို မင်းစိတ်ကြိုက်ပြင်နိုင်ပါတယ်။ ဒါတွေဟာ ကျန်းမာရေးအကြံပြုချက် မဟုတ်ပါဘူးနော်။
          </p>
          <button
            className="mt-5 min-h-11 rounded-full bg-stone-900 px-5 text-white disabled:opacity-50"
            disabled={busy !== null}
            onClick={() =>
              perform("defaults", () =>
                saveRoutines(user.uid, [
                  defaultHydrationRoutine,
                  ...defaultMeals,
                  defaultSleepRoutine,
                ]),
              )
            }
          >
            {busy === "defaults" ? "သိမ်းနေတယ်…" : "နမူနာအစီအစဉ်တွေ သုံးမယ်"}
          </button>
        </section>
      )}

      <Status error={error} syncing={syncing} />

      <section className="rounded-3xl border border-stone-200 bg-white/70 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">ရေသောက်ခြင်း</p>
            <h2 className="text-2xl font-semibold">ရေသောက်ချိန်အစီအစဉ်</h2>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hydration.enabled}
              onChange={(event) => setHydration({ ...hydration, enabled: event.target.checked })}
            />{" "}
            ဖွင့်ထားမယ်
          </label>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <NumberField
            label="တစ်နေ့ ခွက်ရေ"
            value={hydration.dailyTargetGlasses}
            min={1}
            max={30}
            onChange={(value) => setHydration({ ...hydration, dailyTargetGlasses: value })}
          />
          <NumberField
            label="တစ်ခွက် (ml)"
            value={hydration.millilitersPerGlass}
            min={50}
            max={2000}
            step={50}
            onChange={(value) => setHydration({ ...hydration, millilitersPerGlass: value })}
          />
          <TimeField
            label="စမယ့်အချိန်"
            value={hydration.startLocalTime}
            onChange={(value) => setHydration({ ...hydration, startLocalTime: value })}
          />
          <TimeField
            label="ပြီးမယ့်အချိန်"
            value={hydration.endLocalTime}
            onChange={(value) => setHydration({ ...hydration, endLocalTime: value })}
          />
          <NumberField
            label="ဘယ်နှမိနစ်ခြား"
            value={hydration.intervalMinutes}
            min={30}
            max={480}
            step={30}
            onChange={(value) => setHydration({ ...hydration, intervalMinutes: value })}
          />
        </div>
        <p className="mt-3 text-sm text-stone-500">
          မင်းအတွက် အဆင်ပြေမယ့်ပမာဏကိုပဲ ရွေးနော်။ Mochi က သောက်ရမယ့်ရေပမာဏကို ဆေးဘက်ဆိုင်ရာအနေနဲ့
          သတ်မှတ်ပေးတာ မဟုတ်ပါဘူး။
        </p>
        <SaveButton
          busy={busy === "hydration"}
          onClick={() => perform("hydration", () => saveRoutine(user.uid, hydration))}
        />
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white/70 p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">အစားအစာ</p>
            <h2 className="text-2xl font-semibold">စားချိန်အစီအစဉ်</h2>
          </div>
          <button
            className="min-h-11 rounded-full border border-stone-400 px-4"
            onClick={() => {
              const next: MealRoutine = {
                id: `meal-${crypto.randomUUID()}`,
                type: "meal",
                label: "အစားအစာ",
                enabled: true,
                localTime: "12:00",
                sortOrder: meals.length,
              };
              void perform(next.id, () => saveRoutine(user.uid, next));
            }}
          >
            စားချိန်ထည့်မယ်
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          {meals.length === 0 && (
            <p className="text-stone-600">
              စားချိန် မထည့်ရသေးပါဘူး။ မင်းမြင်ချင်တဲ့ စားချိန်တွေကိုပဲ ထည့်လို့ရပါတယ်။
            </p>
          )}
          {meals.map((meal, index) => (
            <MealEditor
              key={`${meal.id}-${meal.label}-${meal.localTime}-${meal.sortOrder}-${meal.enabled}`}
              meal={meal}
              busy={busy === meal.id}
              first={index === 0}
              last={index === meals.length - 1}
              onSave={(value) => perform(value.id, () => saveRoutine(user.uid, value))}
              onDelete={() => perform(meal.id, () => removeRoutine(user.uid, meal.id))}
              onMove={(direction) => {
                const other = meals[index + direction];
                if (!other) return;
                void perform(meal.id, () =>
                  saveRoutines(user.uid, [
                    { ...meal, sortOrder: other.sortOrder },
                    { ...other, sortOrder: meal.sortOrder },
                  ]),
                );
              }}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white/70 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">အိပ်စက်ချိန်</p>
            <h2 className="text-2xl font-semibold">အိပ်ချိန်အစီအစဉ်</h2>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sleep.enabled}
              onChange={(event) => setSleep({ ...sleep, enabled: event.target.checked })}
            />{" "}
            ဖွင့်ထားမယ်
          </label>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <TimeField
            label="အိပ်ရာဝင်ချိန်"
            value={sleep.bedtimeLocalTime}
            onChange={(value) => setSleep({ ...sleep, bedtimeLocalTime: value })}
          />
          <TimeField
            label="နိုးမယ့်အချိန်"
            value={sleep.wakeLocalTime}
            onChange={(value) => setSleep({ ...sleep, wakeLocalTime: value })}
          />
          <NumberField
            label="အိပ်ရာဝင်ဖို့ ပြင်ဆင်ချိန် (မိနစ်)"
            value={sleep.windDownMinutes}
            min={0}
            max={180}
            step={5}
            onChange={(value) => setSleep({ ...sleep, windDownMinutes: value })}
          />
        </div>
        <p className="mt-3 text-sm text-stone-500">
          စီစဉ်ထားတဲ့ကြာချိန်—{Math.floor(sleepMinutes / 60)} နာရီ {sleepMinutes % 60} မိနစ်။ ဒါဟာ
          အိပ်ချိန်အစီအစဉ်သာဖြစ်ပြီး တကယ်အိပ်ပျော်ချိန်ကို တိုင်းတာထားတာ မဟုတ်ပါဘူး။
        </p>
        <SaveButton
          busy={busy === "sleep"}
          onClick={() => perform("sleep", () => saveRoutine(user.uid, sleep))}
        />
      </section>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <input
        className="min-h-11 rounded-xl border border-stone-300 bg-white px-3"
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
    </label>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <input
        className="min-h-11 rounded-xl border border-stone-300 bg-white px-3"
        type="time"
        value={value}
        required
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

function SaveButton({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <button
      className="mt-5 min-h-11 rounded-full bg-stone-900 px-5 text-white disabled:opacity-50"
      disabled={busy}
      onClick={onClick}
    >
      {busy ? "သိမ်းနေတယ်…" : "ပြောင်းလဲမှုတွေ သိမ်းမယ်"}
    </button>
  );
}

function MealEditor({
  meal,
  busy,
  first,
  last,
  onSave,
  onDelete,
  onMove,
}: {
  meal: MealRoutine;
  busy: boolean;
  first: boolean;
  last: boolean;
  onSave: (meal: MealRoutine) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const [draft, setDraft] = useState({ ...meal, label: localizedRoutineLabel(meal.label) });
  return (
    <div className="rounded-2xl border border-stone-200 p-4">
      <div className="grid grid-cols-[1fr_8rem] gap-3">
        <label className="grid gap-2 text-sm">
          အမည်
          <input
            className="min-h-11 rounded-xl border border-stone-300 px-3"
            maxLength={40}
            value={draft.label}
            onChange={(event) => setDraft({ ...draft, label: event.target.value })}
          />
        </label>
        <TimeField
          label="အချိန်"
          value={draft.localTime}
          onChange={(value) => setDraft({ ...draft, localTime: value })}
        />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })}
        />{" "}
        ဒီစားချိန်ကို ပြမယ်
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="min-h-11 rounded-full bg-stone-900 px-4 text-white disabled:opacity-50"
          disabled={busy || !draft.label.trim()}
          onClick={() => onSave(draft)}
        >
          သိမ်းမယ်
        </button>
        <button
          className="min-h-11 rounded-full border border-stone-300 px-4 disabled:opacity-40"
          disabled={first || busy}
          aria-label={`${localizedRoutineLabel(meal.label)} ကို အပေါ်ရွှေ့မယ်`}
          onClick={() => onMove(-1)}
        >
          ↑
        </button>
        <button
          className="min-h-11 rounded-full border border-stone-300 px-4 disabled:opacity-40"
          disabled={last || busy}
          aria-label={`${localizedRoutineLabel(meal.label)} ကို အောက်ရွှေ့မယ်`}
          onClick={() => onMove(1)}
        >
          ↓
        </button>
        <button className="min-h-11 px-3 text-sm text-red-800" disabled={busy} onClick={onDelete}>
          ဖျက်မယ်
        </button>
      </div>
    </div>
  );
}
