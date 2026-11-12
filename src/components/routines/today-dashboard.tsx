"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
import { useGameFeedback } from "@/components/game/game-feedback-provider";
import { CompanionHero, type CompanionAction } from "@/components/mascot/companion-hero";
import { BottomSheet } from "@/components/ui/bottom-sheet";
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
  const { play } = useGameFeedback();
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
  const [activePanel, setActivePanel] = useState<"water" | "meals" | "sleep" | "setup" | null>(null);
  const setupOpened = useRef(false);

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
  const hasMissions = Boolean(hydration || meals.length > 0 || sleep);

  useEffect(() => {
    if (loadingParts > 0 || !user || hasMissions || setupOpened.current) return;
    setupOpened.current = true;
    setActivePanel("setup");
  }, [hasMissions, loadingParts, user]);

  async function perform(label: string, action: () => Promise<unknown>, feedback: "success" | "soft" = "success") {
    setBusy(label);
    setError(null);
    try {
      await action();
      play(feedback);
    } catch (actionError) {
      console.error("Today action failed", actionError);
      setError("ဒီလုပ်ဆောင်ချက်ကို မသိမ်းနိုင်သေးဘူး။ အင်တာနက်အဆင်ပြေတဲ့အခါ ထပ်စမ်းကြည့်ပေးနော်။");
    } finally {
      setBusy(null);
    }
  }

  if (loadingParts > 0)
    return (
      <p className="mt-8 px-5 text-stone-600" role="status">
        Mochi နိုးလာအောင် ခဏစောင့်ပေးနော်…
      </p>
    );
  if (!user) return null;

  const completedMeals = events.filter((event) => event.type === "meal_completed").length;
  const actions: CompanionAction[] = [];
  if (hydration) {
    actions.push({
      id: "water",
      label: `ရေတိုက်မယ်၊ ${waterEvents.length} / ${hydration.dailyTargetGlasses} ခွက်`,
      caption: "ရေ",
      badge: `${waterEvents.length}/${hydration.dailyTargetGlasses}`,
      active: activePanel === "water",
      onClick: () => setActivePanel((panel) => (panel === "water" ? null : "water")),
    });
  }
  if (meals.length > 0) {
    actions.push({
      id: "meals",
      label: `စားချိန်၊ ${completedMeals} / ${meals.length} ပြီး`,
      caption: "စား",
      badge: `${completedMeals}/${meals.length}`,
      active: activePanel === "meals",
      onClick: () => setActivePanel((panel) => (panel === "meals" ? null : "meals")),
    });
  }
  if (sleep) {
    actions.push({
      id: "sleep",
      label: `အိပ်ချိန်၊ ${sleep.bedtimeLocalTime} မှာ`,
      caption: "အိပ်",
      badge: sleep.bedtimeLocalTime,
      active: activePanel === "sleep",
      onClick: () => setActivePanel((panel) => (panel === "sleep" ? null : "sleep")),
    });
  }
  actions.push({
    id: "tummy",
    label: "ဗိုက်လေး မှတ်စုရေးမယ်",
    caption: "ဗိုက်",
    href: "/tummy",
  });

  const name = user.displayName?.split(" ")[0];
  const localHour = Number(
    new Intl.DateTimeFormat("en", { timeZone: timezone, hour: "2-digit", hourCycle: "h23" }).format(
      new Date(),
    ),
  );

  const sheetTitle =
    activePanel === "water"
      ? "ရေတိုက်မယ်"
      : activePanel === "meals"
        ? "စားချိန်"
        : activePanel === "sleep"
          ? "အိပ်ချိန်"
          : activePanel === "setup"
            ? "Mission စီစဉ်မယ်"
            : "";

  return (
    <div className="relative">
      <CompanionHero
        greeting={greetingForHour(localHour)}
        name={name}
        nextUp={nextUp ?? "ဒီနေ့အတွက် နောက်ထပ်အစီအစဉ် မရှိတော့ပါဘူး"}
        actions={actions}
      />

      <div aria-live="polite" className="pointer-events-none absolute inset-x-3 top-[4.8rem] z-30 grid gap-2">
        {!online && (
          <p className="pointer-events-auto rounded-xl bg-amber-100/95 px-3 py-2 text-sm text-amber-950 shadow">
            အင်တာနက် ခဏပြတ်နေတယ်နော်။ ပြောင်းထားတာတွေကို ဒီစက်မှာ စောင့်ထားမယ်။
          </p>
        )}
        {(routineSyncing || eventSyncing) && (
          <p className="rounded-xl bg-white/90 px-3 py-2 text-sm text-stone-600 shadow">
            ပြောင်းလဲထားတာလေးတွေ သိမ်းနေတယ်…
          </p>
        )}
        {error && (
          <p className="pointer-events-auto rounded-xl bg-red-100/95 px-3 py-2 text-sm text-red-900 shadow" role="alert">
            {error}
          </p>
        )}
      </div>

      <BottomSheet
        open={activePanel !== null}
        title={sheetTitle}
        onClose={() => setActivePanel(null)}
      >
        {activePanel === "setup" && (
          <div className="grid gap-4 py-1">
            <p className="text-stone-600">
              ရေ၊ စားချိန်၊ အိပ်ချိန်တွေကို စိတ်ကြိုက်ထည့်လို့ရပါတယ်။ ဒါတွေဟာ နမူနာသာဖြစ်ပြီး
              ဆေးဘက်ဆိုင်ရာသတ်မှတ်ချက် မဟုတ်ပါဘူးနော်။
            </p>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-900 px-5 text-white"
              href="/routine"
              onClick={() => setActivePanel(null)}
            >
              အစီအစဉ်တွေ ထည့်မယ်
            </Link>
          </div>
        )}

        {hydration && activePanel === "water" && (
          <WaterPanel
            hydration={hydration}
            waterCount={waterEvents.length}
            busy={busy}
            onAdd={() =>
              perform("water", () =>
                logDailyEvent(user.uid, localDate, { type: "water", routineId: hydration.id }),
              )
            }
            onUndo={() =>
              waterEvents[0] &&
              perform(
                "undo-water",
                () => removeDailyEvent(user.uid, localDate, waterEvents[0].id),
                "soft",
              )
            }
            canUndo={Boolean(waterEvents[0])}
          />
        )}

        {meals.length > 0 && activePanel === "meals" && (
          <div className="grid gap-3 py-1">
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
        )}

        {sleep && activePanel === "sleep" && (
          <SleepPanel
            sleep={sleep}
            events={events}
            busy={busy}
            onLog={(type) =>
              perform(type, () =>
                logDailyEvent(user.uid, localDate, { id: type, type, routineId: sleep.id }),
              )
            }
            onUndo={(event) =>
              perform(
                `undo-${event.type}`,
                () => removeDailyEvent(user.uid, localDate, event.id),
                "soft",
              )
            }
          />
        )}
      </BottomSheet>
    </div>
  );
}

function WaterPanel({
  hydration,
  waterCount,
  busy,
  onAdd,
  onUndo,
  canUndo,
}: {
  hydration: HydrationRoutine;
  waterCount: number;
  busy: string | null;
  onAdd: () => void;
  onUndo: () => void;
  canUndo: boolean;
}) {
  return (
    <div className="grid gap-4 py-1">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500">ဒီနေ့သောက်ပြီး</p>
          <p className="text-3xl font-semibold text-[#3a2a24]">
            {waterCount}
            <span className="text-lg font-medium text-stone-500">
              {" "}
              / {hydration.dailyTargetGlasses} ခွက်
            </span>
          </p>
        </div>
        <p className="text-sm text-stone-500">{hydration.millilitersPerGlass} ml / ခွက်</p>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-label="ဒီနေ့ ရေသောက်ပြီးမှု"
        aria-valuemin={0}
        aria-valuemax={hydration.dailyTargetGlasses}
        aria-valuenow={Math.min(waterCount, hydration.dailyTargetGlasses)}
      >
        <div
          className="h-full rounded-full bg-[#75a7a0] transition-[width]"
          style={{
            width: `${Math.min(100, (waterCount / hydration.dailyTargetGlasses) * 100)}%`,
          }}
        />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <button
          type="button"
          className="min-h-12 rounded-full bg-stone-900 px-5 text-white disabled:opacity-50"
          disabled={busy === "water"}
          onClick={onAdd}
        >
          {busy === "water" ? "ထည့်နေတယ်…" : "+ ရေတစ်ခွက်"}
        </button>
        <button
          type="button"
          className="min-h-12 rounded-full border border-stone-300 px-4 disabled:opacity-40"
          disabled={!canUndo || busy === "undo-water"}
          onClick={onUndo}
        >
          ဖျက်
        </button>
      </div>
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
        ? "ကျော်ထားတယ်"
        : "မမှတ်ရသေး";
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex justify-between gap-3">
        <div>
          <h3 className="font-semibold">{localizedRoutineLabel(meal.label)}</h3>
          <p className="text-sm text-stone-500">{meal.localTime}</p>
        </div>
        <span className="text-sm text-stone-600">{status}</span>
      </div>
      <label className="mt-3 grid gap-1 text-xs text-stone-500">
        မှတ်စုတို
        <input
          className="min-h-10 rounded-xl border border-stone-200 bg-[#fffaf5] px-3 text-sm text-stone-900"
          maxLength={200}
          value={note}
          onChange={(eventValue) => setNote(eventValue.target.value)}
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-10 rounded-full bg-stone-900 px-4 text-sm text-white disabled:opacity-50"
          disabled={busy}
          onClick={() => onChange("meal_completed", note)}
        >
          စားပြီးပြီ
        </button>
        <button
          type="button"
          className="min-h-10 rounded-full border border-stone-300 px-4 text-sm disabled:opacity-50"
          disabled={busy}
          onClick={() => onChange("meal_skipped", note)}
        >
          ကျော်မယ်
        </button>
        {event && (
          <button
            type="button"
            className="min-h-10 px-3 text-sm underline"
            disabled={busy}
            onClick={() => onChange(null)}
          >
            ပြန်ပြင်
          </button>
        )}
      </div>
    </div>
  );
}

function SleepPanel({
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
  const minutes = sleepDurationMinutes(sleep.bedtimeLocalTime, sleep.wakeLocalTime);
  return (
    <div className="grid gap-4 py-1">
      <div>
        <p className="text-sm text-stone-500">စီစဉ်ထားတဲ့အချိန်</p>
        <p className="text-2xl font-semibold text-[#3a2a24]">
          {sleep.bedtimeLocalTime} → {sleep.wakeLocalTime}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          {Math.floor(minutes / 60)} နာရီ {minutes % 60} မိနစ် · ကိုယ်တိုင်မှတ်ချက်သာ
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <LogButton
          label={bedtime ? "အိပ်ရာဝင် ✓" : "အိပ်ရာဝင်ပြီ"}
          busy={busy === "bedtime_logged"}
          event={bedtime}
          onLog={() => onLog("bedtime_logged")}
          onUndo={onUndo}
        />
        <LogButton
          label={wake ? "နိုးပြီး ✓" : "နိုးပြီ"}
          busy={busy === "wake_logged"}
          event={wake}
          onLog={() => onLog("wake_logged")}
          onUndo={onUndo}
        />
      </div>
    </div>
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
      type="button"
      className="min-h-12 rounded-full border border-stone-300 bg-white px-3 text-sm font-semibold disabled:opacity-50"
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
