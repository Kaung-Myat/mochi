"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
import { detectTimezone } from "@/lib/profile/schema";
import { greetingForHour, localDateKey, sleepDurationMinutes } from "@/lib/routines/date";
import type { DailyEvent } from "@/lib/routines/events";
import {
  logDailyEvent,
  removeDailyEvent,
  subscribeDailyEvents,
  subscribeRoutines,
} from "@/lib/routines/repository";
import {
  localizedRoutineLabel,
  type HydrationRoutine,
  type MealRoutine,
  type Routine,
  type SleepRoutine,
} from "@/lib/routines/schema";

function useOnline() {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export function TodayDashboard() {
  const { user } = useAuthState();
  const online = useOnline();
  const timezone = detectTimezone();
  const localDate = localDateKey(new Date(), timezone);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [loadingParts, setLoadingParts] = useState(2);
  const [routineSyncing, setRoutineSyncing] = useState(false);
  const [eventSyncing, setEventSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const loaded = () => setLoadingParts((value) => Math.max(0, value - 1));
    const fail = (loadError: Error) => {
      console.error("Today data subscription failed", loadError);
      setError(
        "ဒီနေ့အချက်အလက်တွေကို Mochi ပြန်မဖွင့်နိုင်သေးဘူး။ သိမ်းထားပြီးသားတွေကတော့ လုံခြုံပါတယ်နော်။",
      );
      loaded();
    };
    const unsubscribeRoutines = subscribeRoutines(
      user.uid,
      (values, pending) => {
        setRoutines(values);
        setRoutineSyncing(pending);
        loaded();
      },
      fail,
    );
    const unsubscribeEvents = subscribeDailyEvents(
      user.uid,
      localDate,
      (values, pending) => {
        setEvents(values);
        setEventSyncing(pending);
        loaded();
      },
      fail,
    );
    return () => {
      unsubscribeRoutines();
      unsubscribeEvents();
    };
  }, [localDate, user]);

  const hydration = routines.find(
    (routine): routine is HydrationRoutine => routine.type === "hydration",
  );
  const sleep = routines.find((routine): routine is SleepRoutine => routine.type === "sleep");
  const meals = routines
    .filter((routine): routine is MealRoutine => routine.type === "meal" && routine.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const waterEvents = events.filter((event) => event.type === "water");
  const nextUp = useMemo(() => findNextUp(routines, new Date(), timezone), [routines, timezone]);

  async function perform(label: string, action: () => Promise<unknown>) {
    setBusy(label);
    setError(null);
    try {
      await action();
    } catch (actionError) {
      console.error("Today action failed", actionError);
      setError("ဒီလုပ်ဆောင်ချက်ကို မသိမ်းနိုင်သေးဘူး။ အင်တာနက်အဆင်ပြေတဲ့အခါ ထပ်စမ်းကြည့်ပေးနော်။");
    } finally {
      setBusy(null);
    }
  }

  if (loadingParts > 0)
    return (
      <p className="mt-8 text-stone-600" role="status">
        Mochi နိုးလာအောင် ခဏစောင့်ပေးနော်…
      </p>
    );
  if (!user) return null;

  const name = user.displayName?.split(" ")[0];
  const localHour = Number(
    new Intl.DateTimeFormat("en", { timeZone: timezone, hour: "2-digit", hourCycle: "h23" }).format(
      new Date(),
    ),
  );

  return (
    <div className="mt-7 grid gap-5">
      <div aria-live="polite" className="grid gap-2">
        {!online && (
          <p className="rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-950">
            အင်တာနက် ခဏပြတ်နေတယ်နော်။ ပြောင်းထားတာတွေကို ဒီစက်မှာ လုံခြုံစွာစောင့်ထားပြီး
            အင်တာနက်ပြန်ရတာနဲ့ သိမ်းပေးမယ်။
          </p>
        )}
        {(routineSyncing || eventSyncing) && (
          <p className="text-sm text-stone-500">ပြောင်းလဲထားတာလေးတွေ သိမ်းနေတယ်…</p>
        )}
        {error && (
          <p className="text-sm text-red-800" role="alert">
            {error}
          </p>
        )}
      </div>

      <section className="rounded-3xl bg-[#f4dfd4] p-6">
        <p className="text-sm font-medium text-stone-600">
          {greetingForHour(localHour)}
          {name ? `၊ ${name}` : ""}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">တစ်ခုပြီးတစ်ခု အေးအေးဆေးဆေး လုပ်ကြမယ်နော်။</h2>
        <div className="mt-5 rounded-2xl bg-white/60 p-4">
          <p className="text-xs font-semibold tracking-wide text-stone-500">နောက်တစ်ခု</p>
          <p className="mt-1 font-medium">{nextUp ?? "ဒီနေ့အတွက် နောက်ထပ်အစီအစဉ် မရှိတော့ပါဘူး"}</p>
        </div>
      </section>

      {!hydration && meals.length === 0 && !sleep && (
        <section className="rounded-3xl border border-dashed border-stone-400 p-6">
          <h2 className="text-xl font-semibold">ဒီနေ့ကို မင်းစိတ်ကြိုက် စီစဉ်မယ်</h2>
          <p className="mt-2 text-stone-600">
            ရေသောက်ချိန်၊ စားချိန်နဲ့ အိပ်ချိန်တွေကို စိတ်ကြိုက်ထည့်လို့ရပါတယ်။ ဒါတွေဟာ
            နမူနာသာဖြစ်ပြီး ဆေးဘက်ဆိုင်ရာသတ်မှတ်ချက် မဟုတ်ပါဘူးနော်။
          </p>
          <Link
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-stone-900 px-5 text-white"
            href="/routine"
          >
            အစီအစဉ်တွေ ထည့်မယ်
          </Link>
        </section>
      )}

      {hydration && (
        <section className="rounded-3xl border border-stone-200 bg-white/70 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500">ရေသောက်ခြင်း</p>
              <h2 className="text-2xl font-semibold">
                {hydration.dailyTargetGlasses} ခွက်ထဲမှ {waterEvents.length} ခွက်
              </h2>
            </div>
            <span className="text-3xl" aria-hidden="true">
              💧
            </span>
          </div>
          <div
            className="mt-4 h-3 overflow-hidden rounded-full bg-stone-200"
            role="progressbar"
            aria-label="ဒီနေ့ ရေသောက်ပြီးမှု"
            aria-valuemin={0}
            aria-valuemax={hydration.dailyTargetGlasses}
            aria-valuenow={Math.min(waterEvents.length, hydration.dailyTargetGlasses)}
          >
            <div
              className="h-full rounded-full bg-[#75a7a0] transition-[width]"
              style={{
                width: `${Math.min(100, (waterEvents.length / hydration.dailyTargetGlasses) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-sm text-stone-500">
            တစ်ခွက်လျှင် {hydration.millilitersPerGlass} ml · မင်းစိတ်ကြိုက်ပြင်နိုင်တဲ့ ပမာဏ
          </p>
          <div className="mt-5 flex gap-3">
            <button
              className="min-h-12 flex-1 rounded-full bg-stone-900 px-5 text-white disabled:opacity-50"
              disabled={busy === "water"}
              onClick={() =>
                perform("water", () =>
                  logDailyEvent(user.uid, localDate, { type: "water", routineId: hydration.id }),
                )
              }
            >
              {busy === "water" ? "ထည့်နေတယ်…" : "+ ရေတစ်ခွက် သောက်ပြီးပြီ"}
            </button>
            <button
              className="min-h-12 rounded-full border border-stone-300 px-4 disabled:opacity-40"
              disabled={!waterEvents[0] || busy === "undo-water"}
              onClick={() =>
                waterEvents[0] &&
                perform("undo-water", () =>
                  removeDailyEvent(user.uid, localDate, waterEvents[0].id),
                )
              }
            >
              ပြန်ဖျက်မယ်
            </button>
          </div>
        </section>
      )}

      {meals.length > 0 && (
        <section className="rounded-3xl border border-stone-200 bg-white/70 p-5">
          <p className="text-sm text-stone-500">အစားအစာ</p>
          <h2 className="text-2xl font-semibold">ဒီနေ့ စားချိန်များ</h2>
          <div className="mt-4 grid gap-3">
            {meals.map((meal) => {
              const event = events.find(
                (value) =>
                  value.routineId === meal.id &&
                  (value.type === "meal_completed" || value.type === "meal_skipped"),
              );
              return (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  event={event}
                  busy={busy === meal.id}
                  onChange={(type, note) =>
                    perform(meal.id, () =>
                      type
                        ? logDailyEvent(user.uid, localDate, {
                            id: `meal-${meal.id}`,
                            type,
                            routineId: meal.id,
                            note,
                          })
                        : event
                          ? removeDailyEvent(user.uid, localDate, event.id)
                          : Promise.resolve(),
                    )
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {sleep && (
        <SleepCard
          sleep={sleep}
          events={events}
          busy={busy}
          onLog={(type) =>
            perform(type, () =>
              logDailyEvent(user.uid, localDate, { id: type, type, routineId: sleep.id }),
            )
          }
          onUndo={(event) =>
            perform(`undo-${event.type}`, () => removeDailyEvent(user.uid, localDate, event.id))
          }
        />
      )}

      <Link className="rounded-3xl border border-stone-200 bg-white/70 p-5" href="/tummy">
        <p className="text-sm text-stone-500">အမြန်မှတ်စု</p>
        <p className="mt-1 text-xl font-semibold">ဒီနေ့ ဗိုက်လေး ဘယ်လိုနေသေးလဲ? →</p>
      </Link>
    </div>
  );
}

function MealCard({
  meal,
  event,
  busy,
  onChange,
}: {
  meal: MealRoutine;
  event?: DailyEvent;
  busy: boolean;
  onChange: (type: "meal_completed" | "meal_skipped" | null, note?: string) => void;
}) {
  const [note, setNote] = useState(event?.note ?? "");
  const status =
    event?.type === "meal_completed"
      ? "စားပြီးပြီ"
      : event?.type === "meal_skipped"
        ? "ဒီနေ့ ကျော်ထားတယ်"
        : "မမှတ်ရသေးပါ";
  return (
    <div className="rounded-2xl bg-[#fffaf3] p-4">
      <div className="flex justify-between gap-4">
        <div>
          <h3 className="font-semibold">{localizedRoutineLabel(meal.label)}</h3>
          <p className="text-sm text-stone-500">{meal.localTime}</p>
        </div>
        <span className="text-sm text-stone-600">{status}</span>
      </div>
      <label className="mt-3 grid gap-1 text-xs text-stone-500">
        မှတ်စုတို (မထည့်လည်းရပါတယ်)
        <input
          className="min-h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900"
          maxLength={200}
          value={note}
          onChange={(eventValue) => setNote(eventValue.target.value)}
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="min-h-10 rounded-full bg-stone-900 px-4 text-sm text-white disabled:opacity-50"
          disabled={busy}
          onClick={() => onChange("meal_completed", note)}
        >
          စားပြီးပြီ
        </button>
        <button
          className="min-h-10 rounded-full border border-stone-300 px-4 text-sm disabled:opacity-50"
          disabled={busy}
          onClick={() => onChange("meal_skipped", note)}
        >
          ဒီနေ့ ကျော်မယ်
        </button>
        {event && (
          <button
            className="min-h-10 px-3 text-sm underline"
            disabled={busy}
            onClick={() => onChange(null)}
          >
            ပြန်ပြင်မယ်
          </button>
        )}
      </div>
    </div>
  );
}

function SleepCard({
  sleep,
  events,
  busy,
  onLog,
  onUndo,
}: {
  sleep: SleepRoutine;
  events: DailyEvent[];
  busy: string | null;
  onLog: (type: "bedtime_logged" | "wake_logged") => void;
  onUndo: (event: DailyEvent) => void;
}) {
  const bedtime = events.find((event) => event.type === "bedtime_logged");
  const wake = events.find((event) => event.type === "wake_logged");
  return (
    <section className="rounded-3xl border border-stone-200 bg-white/70 p-5">
      <p className="text-sm text-stone-500">အိပ်ချိန်အစီအစဉ်</p>
      <h2 className="text-2xl font-semibold">
        {sleep.bedtimeLocalTime} → {sleep.wakeLocalTime}
      </h2>
      <p className="mt-2 text-sm text-stone-500">
        စီစဉ်ထားတဲ့ကြာချိန်—
        {Math.floor(
          sleepDurationMinutes(sleep.bedtimeLocalTime, sleep.wakeLocalTime) / 60,
        )} နာရီ {sleepDurationMinutes(sleep.bedtimeLocalTime, sleep.wakeLocalTime) % 60} မိနစ်။ ဒါဟာ
        မင်းကိုယ်တိုင်မှတ်ထားတဲ့အချိန်ဖြစ်ပြီး တကယ်အိပ်ပျော်ချိန်ကို အလိုအလျောက်တိုင်းထားတာ
        မဟုတ်ပါဘူး။
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <LogButton
          label={bedtime ? "အိပ်ရာဝင်ချိန် မှတ်ပြီး ✓" : "အိပ်ရာဝင်ပြီ"}
          busy={busy === "bedtime_logged"}
          event={bedtime}
          onLog={() => onLog("bedtime_logged")}
          onUndo={onUndo}
        />
        <LogButton
          label={wake ? "နိုးချိန် မှတ်ပြီး ✓" : "နိုးပြီ"}
          busy={busy === "wake_logged"}
          event={wake}
          onLog={() => onLog("wake_logged")}
          onUndo={onUndo}
        />
      </div>
    </section>
  );
}

function LogButton({
  label,
  busy,
  event,
  onLog,
  onUndo,
}: {
  label: string;
  busy: boolean;
  event?: DailyEvent;
  onLog: () => void;
  onUndo: (event: DailyEvent) => void;
}) {
  return (
    <button
      className="min-h-12 rounded-full border border-stone-300 px-3 text-sm disabled:opacity-50"
      disabled={busy}
      onClick={() => (event ? onUndo(event) : onLog())}
    >
      {label}
    </button>
  );
}

function findNextUp(routines: Routine[], now: Date, timezone: string): string | null {
  const time = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const candidates: { time: string; label: string }[] = [];
  for (const routine of routines.filter((value) => value.enabled)) {
    if (routine.type === "meal")
      candidates.push({
        time: routine.localTime,
        label: `${localizedRoutineLabel(routine.label)} — ${routine.localTime}`,
      });
    if (routine.type === "sleep")
      candidates.push({
        time: routine.bedtimeLocalTime,
        label: `အိပ်ရာဝင်ဖို့ ပြင်ဆင်ချိန် — ${routine.bedtimeLocalTime}`,
      });
    if (routine.type === "hydration") {
      const [startHour, startMinute] = routine.startLocalTime.split(":").map(Number);
      const [endHour, endMinute] = routine.endLocalTime.split(":").map(Number);
      for (
        let minutes = startHour * 60 + startMinute;
        minutes <= endHour * 60 + endMinute;
        minutes += routine.intervalMinutes
      ) {
        const candidateTime = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
        candidates.push({ time: candidateTime, label: `ရေသောက်ချိန်လေး — ${candidateTime}` });
      }
    }
  }
  return (
    candidates
      .filter((candidate) => candidate.time >= time)
      .sort((a, b) => a.time.localeCompare(b.time))[0]?.label ?? null
  );
}
