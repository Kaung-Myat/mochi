"use client";

import { type MouseEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
import { useGameFeedback } from "@/components/game/game-feedback-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
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

type SheetState =
  | { type: "water" }
  | { type: "sleep" }
  | { type: "meal"; meal: MealRoutine | null }
  | null;

export function RoutineSettings() {
  const { user } = useAuthState();
  const { play } = useGameFeedback();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [hydration, setHydration] = useState(defaultHydrationRoutine);
  const [sleep, setSleep] = useState(defaultSleepRoutine);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);

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

  async function perform(label: string, action: () => Promise<void>, feedback: "success" | "soft" = "success") {
    setBusy(label);
    setError(null);
    try {
      await action();
      play(feedback);
    } catch (actionError) {
      console.error("Routine update failed", actionError);
      setError("ဒီပြောင်းလဲမှုကို မသိမ်းနိုင်သေးဘူး။ ထပ်စမ်းကြည့်ပေးနော်။");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <p className="mt-6 text-center text-sm text-stone-600" role="status">
        Mission board ဖွင့်နေတယ်…
      </p>
    );
  }
  if (!user) return null;

  const hasSavedRoutines = routines.length > 0;
  const sleepMinutes = sleepDurationMinutes(sleep.bedtimeLocalTime, sleep.wakeLocalTime);
  const editingMeal = sheet?.type === "meal" ? sheet.meal : null;

  return (
    <div className="mt-4 grid gap-3">
      {!hasSavedRoutines && (
        <section className="rounded-[1.5rem] border-[3px] border-dashed border-white bg-[#ffe8d8] px-4 py-4 shadow-[0_5px_0_#f0c9a8]">
          <p className="text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">START HERE</p>
          <h2 className="mt-0.5 text-lg font-semibold text-[#3a2a24]">နမူနာ Mission တွေနဲ့ စမယ်</h2>
          <p className="mt-1 text-[0.78rem] text-[#6b5548]">
            ရေ · စား · အိပ် — ပြင်ချင်ရင် နောက်မှ sheet ထဲမှာ ပြင်လို့ရတယ်။
          </p>
          <button
            type="button"
            className="mt-3 min-h-11 w-full rounded-full bg-[#3a2a24] text-sm font-semibold text-white shadow-[0_4px_0_#1f1612] disabled:opacity-50 active:translate-y-0.5 active:shadow-none"
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
            {busy === "defaults" ? "သိမ်းနေတယ်…" : "နမူနာ Mission သုံးမယ်"}
          </button>
        </section>
      )}

      {(error || syncing) && (
        <p
          className={`rounded-2xl px-3 py-2 text-sm ${error ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-950"}`}
          role={error ? "alert" : "status"}
        >
          {error ?? "ပြောင်းလဲထားတာတွေကို သိမ်းနေတယ်…"}
        </p>
      )}

      <QuestCard
        eyebrow="WATER QUEST"
        title="ရေသောက်ခြင်း"
        tone="water"
        enabled={hydration.enabled}
        lines={[
          `${hydration.dailyTargetGlasses} ခွက် · ${hydration.millilitersPerGlass} ml`,
          `${hydration.startLocalTime}–${hydration.endLocalTime} · ${hydration.intervalMinutes} မိနစ်ခြား`,
        ]}
        onClick={() => {
          play("tap");
          setSheet({ type: "water" });
        }}
      />

      <section className="rounded-[1.5rem] border-[3px] border-white bg-white/90 p-3 shadow-[0_5px_0_#f0c9a8]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">MEAL QUESTS</p>
            <h2 className="text-base font-semibold text-[#3a2a24]">စားချိန်</h2>
          </div>
          <button
            type="button"
            className="min-h-10 rounded-full border-2 border-[#3a2a24] bg-[#ffd15c] px-3 text-[0.72rem] font-semibold text-[#3a2a24] shadow-[0_2px_0_#e2b000] active:translate-y-0.5 active:shadow-none"
            onClick={() => {
              play("tap");
              setSheet({
                type: "meal",
                meal: {
                  id: `meal-${crypto.randomUUID()}`,
                  type: "meal",
                  label: "အစားအစာ",
                  enabled: true,
                  localTime: "12:00",
                  sortOrder: meals.length,
                },
              });
            }}
          >
            + ထည့်မယ်
          </button>
        </div>

        {meals.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-[#fffaf3] px-3 py-4 text-center text-sm text-stone-600">
            စားချိန် မရှိသေးဘူး။ ထည့်ချင်ရင် + ကို နှိပ်နော်။
          </p>
        ) : (
          <div className="mt-2.5 grid gap-2">
            {meals.map((meal, index) => (
              <button
                key={meal.id}
                type="button"
                onClick={() => {
                  play("tap");
                  setSheet({ type: "meal", meal });
                }}
                className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border-2 border-[#f0d2bc] bg-[#fffaf3] px-3 text-left active:scale-[0.99]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#3a2a24]">
                    {localizedRoutineLabel(meal.label)}
                  </span>
                  <span className="block text-[0.68rem] text-stone-500">
                    {meal.localTime}
                    {meal.enabled ? "" : " · ပိတ်ထား"}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <IconButton
                    label="အပေါ်ရွှေ့"
                    disabled={index === 0 || busy !== null}
                    onClick={(event) => {
                      event.stopPropagation();
                      const other = meals[index - 1];
                      if (!other) return;
                      void perform(
                        meal.id,
                        () =>
                          saveRoutines(user.uid, [
                            { ...meal, sortOrder: other.sortOrder },
                            { ...other, sortOrder: meal.sortOrder },
                          ]),
                        "soft",
                      );
                    }}
                  >
                    ↑
                  </IconButton>
                  <IconButton
                    label="အောက်ရွှေ့"
                    disabled={index === meals.length - 1 || busy !== null}
                    onClick={(event) => {
                      event.stopPropagation();
                      const other = meals[index + 1];
                      if (!other) return;
                      void perform(
                        meal.id,
                        () =>
                          saveRoutines(user.uid, [
                            { ...meal, sortOrder: other.sortOrder },
                            { ...other, sortOrder: meal.sortOrder },
                          ]),
                        "soft",
                      );
                    }}
                  >
                    ↓
                  </IconButton>
                  <span className="text-[#c45a3c]" aria-hidden="true">
                    ›
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <QuestCard
        eyebrow="SLEEP QUEST"
        title="အိပ်ချိန်"
        tone="sleep"
        enabled={sleep.enabled}
        lines={[
          `${sleep.bedtimeLocalTime} → ${sleep.wakeLocalTime}`,
          `${Math.floor(sleepMinutes / 60)} နာရီ ${sleepMinutes % 60} မိနစ် · ပြင်ဆင် ${sleep.windDownMinutes} မိနစ်`,
        ]}
        onClick={() => {
          play("tap");
          setSheet({ type: "sleep" });
        }}
      />

      <BottomSheet
        open={sheet?.type === "water"}
        title="ရေ Quest ပြင်မယ်"
        closeLabel="ပိတ်မယ်"
        onClose={() => setSheet(null)}
      >
        <WaterSheet
          initial={hydration}
          busy={busy === "hydration"}
          onSave={(value) =>
            perform("hydration", async () => {
              await saveRoutine(user.uid, value);
              setHydration(value);
              setSheet(null);
            })
          }
        />
      </BottomSheet>

      <BottomSheet
        open={sheet?.type === "sleep"}
        title="အိပ်ချိန် Quest ပြင်မယ်"
        closeLabel="ပိတ်မယ်"
        onClose={() => setSheet(null)}
      >
        <SleepSheet
          initial={sleep}
          busy={busy === "sleep"}
          onSave={(value) =>
            perform("sleep", async () => {
              await saveRoutine(user.uid, value);
              setSleep(value);
              setSheet(null);
            })
          }
        />
      </BottomSheet>

      <BottomSheet
        open={sheet?.type === "meal"}
        title={editingMeal && routines.some((r) => r.id === editingMeal.id) ? "စားချိန် ပြင်မယ်" : "စားချိန် အသစ်"}
        closeLabel="ပိတ်မယ်"
        onClose={() => setSheet(null)}
      >
        {editingMeal && (
          <MealSheet
            meal={editingMeal}
            busy={busy === editingMeal.id}
            isNew={!routines.some((routine) => routine.id === editingMeal.id)}
            onSave={(value) =>
              perform(value.id, async () => {
                await saveRoutine(user.uid, value);
                setSheet(null);
              })
            }
            onDelete={() =>
              perform(
                editingMeal.id,
                async () => {
                  await removeRoutine(user.uid, editingMeal.id);
                  setSheet(null);
                },
                "soft",
              )
            }
          />
        )}
      </BottomSheet>
    </div>
  );
}

function QuestCard({
  eyebrow,
  title,
  lines,
  enabled,
  tone,
  onClick,
}: {
  eyebrow: string;
  title: string;
  lines: string[];
  enabled: boolean;
  tone: "water" | "sleep";
  onClick: () => void;
}) {
  const accent = tone === "water" ? "bg-[#7ec8f8]" : "bg-[#b8a0ff]";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[1.5rem] border-[3px] border-white bg-white/90 p-3 text-left shadow-[0_5px_0_#f0c9a8] active:translate-y-0.5 active:shadow-[0_3px_0_#f0c9a8]"
    >
      <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${accent} text-white shadow-[0_3px_0_rgb(0_0_0_/_.15)]`}>
        {tone === "water" ? <CupIcon /> : <MoonIcon />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">
          {eyebrow}
        </span>
        <span className="block text-base font-semibold text-[#3a2a24]">
          {title}
          {!enabled && <span className="ml-2 text-[0.68rem] font-medium text-stone-500">ပိတ်</span>}
        </span>
        {lines.map((line) => (
          <span key={line} className="block truncate text-[0.72rem] text-stone-500">
            {line}
          </span>
        ))}
      </span>
      <span className="text-[#c45a3c]" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

function WaterSheet({
  initial,
  busy,
  onSave,
}: {
  initial: HydrationRoutine;
  busy: boolean;
  onSave: (value: HydrationRoutine) => void;
}) {
  const [draft, setDraft] = useState(initial);
  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  return (
    <div className="grid gap-3 py-1">
      <EnableToggle
        checked={draft.enabled}
        onChange={(enabled) => setDraft({ ...draft, enabled })}
        label="ဒီ Quest ကို ဖွင့်ထားမယ်"
      />
      <div className="grid grid-cols-2 gap-2.5">
        <NumberField
          label="တစ်နေ့ ခွက်ရေ"
          value={draft.dailyTargetGlasses}
          min={1}
          max={30}
          onChange={(value) => setDraft({ ...draft, dailyTargetGlasses: value })}
        />
        <NumberField
          label="တစ်ခွက် (ml)"
          value={draft.millilitersPerGlass}
          min={50}
          max={2000}
          step={50}
          onChange={(value) => setDraft({ ...draft, millilitersPerGlass: value })}
        />
        <TimeField
          label="စမယ့်အချိန်"
          value={draft.startLocalTime}
          onChange={(value) => setDraft({ ...draft, startLocalTime: value })}
        />
        <TimeField
          label="ပြီးမယ့်အချိန်"
          value={draft.endLocalTime}
          onChange={(value) => setDraft({ ...draft, endLocalTime: value })}
        />
      </div>
      <NumberField
        label="ဘယ်နှမိနစ်ခြား သတိပေးမလဲ"
        value={draft.intervalMinutes}
        min={30}
        max={480}
        step={30}
        onChange={(value) => setDraft({ ...draft, intervalMinutes: value })}
      />
      <p className="text-[0.72rem] text-stone-500">
        Mochi က ဆေးဘက်ဆိုင်ရာ ရေပမာဏ မသတ်မှတ်ပါဘူး — မင်းအဆင်ပြေတဲ့ ပမာဏပဲ ရွေးနော်။
      </p>
      <SaveButton busy={busy} onClick={() => onSave(draft)} />
    </div>
  );
}

function SleepSheet({
  initial,
  busy,
  onSave,
}: {
  initial: SleepRoutine;
  busy: boolean;
  onSave: (value: SleepRoutine) => void;
}) {
  const [draft, setDraft] = useState(initial);
  useEffect(() => {
    setDraft(initial);
  }, [initial]);
  const minutes = sleepDurationMinutes(draft.bedtimeLocalTime, draft.wakeLocalTime);

  return (
    <div className="grid gap-3 py-1">
      <EnableToggle
        checked={draft.enabled}
        onChange={(enabled) => setDraft({ ...draft, enabled })}
        label="ဒီ Quest ကို ဖွင့်ထားမယ်"
      />
      <div className="grid grid-cols-2 gap-2.5">
        <TimeField
          label="အိပ်ရာဝင်ချိန်"
          value={draft.bedtimeLocalTime}
          onChange={(value) => setDraft({ ...draft, bedtimeLocalTime: value })}
        />
        <TimeField
          label="နိုးမယ့်အချိန်"
          value={draft.wakeLocalTime}
          onChange={(value) => setDraft({ ...draft, wakeLocalTime: value })}
        />
      </div>
      <NumberField
        label="ပြင်ဆင်ချိန် (မိနစ်)"
        value={draft.windDownMinutes}
        min={0}
        max={180}
        step={5}
        onChange={(value) => setDraft({ ...draft, windDownMinutes: value })}
      />
      <p className="rounded-2xl bg-[#fffaf3] px-3 py-2 text-[0.78rem] text-stone-600">
        စီစဉ်ထားတဲ့ကြာချိန် — {Math.floor(minutes / 60)} နာရီ {minutes % 60} မိနစ်
      </p>
      <SaveButton busy={busy} onClick={() => onSave(draft)} />
    </div>
  );
}

function MealSheet({
  meal,
  busy,
  isNew,
  onSave,
  onDelete,
}: {
  meal: MealRoutine;
  busy: boolean;
  isNew: boolean;
  onSave: (meal: MealRoutine) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState({ ...meal, label: localizedRoutineLabel(meal.label) });

  useEffect(() => {
    setDraft({ ...meal, label: localizedRoutineLabel(meal.label) });
  }, [meal]);

  return (
    <div className="grid gap-3 py-1">
      <label className="grid gap-1.5">
        <span className="text-[0.78rem] font-semibold text-[#3a2a24]">အမည်</span>
        <input
          className="mission-input min-h-11 rounded-2xl border-2 border-[#f0d2bc] bg-white px-3"
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
      <EnableToggle
        checked={draft.enabled}
        onChange={(enabled) => setDraft({ ...draft, enabled })}
        label="ဒီစားချိန်ကို ပြမယ်"
      />
      <SaveButton
        busy={busy}
        disabled={!draft.label.trim()}
        onClick={() => onSave({ ...draft, label: draft.label.trim() })}
      />
      {!isNew && (
        <button
          type="button"
          className="min-h-11 rounded-full border-2 border-red-200 bg-red-50 text-sm font-semibold text-red-800 disabled:opacity-50"
          disabled={busy}
          onClick={onDelete}
        >
          ဖျက်မယ်
        </button>
      )}
    </div>
  );
}

function EnableToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-11 w-full items-center justify-between rounded-2xl border-2 px-3 text-left text-sm font-semibold ${
        checked
          ? "border-[#3a2a24] bg-[#ffd15c] text-[#3a2a24]"
          : "border-[#f0d2bc] bg-white text-[#6b5548]"
      }`}
    >
      <span>{label}</span>
      <span className="text-[0.72rem]">{checked ? "ON" : "OFF"}</span>
    </button>
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
    <label className="grid gap-1.5 text-[0.78rem] font-semibold text-[#3a2a24]">
      {label}
      <input
        className="mission-input min-h-11 rounded-2xl border-2 border-[#f0d2bc] bg-white px-3 text-sm font-medium"
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
    <label className="grid gap-1.5 text-[0.78rem] font-semibold text-[#3a2a24]">
      {label}
      <input
        className="mission-input min-h-11 rounded-2xl border-2 border-[#f0d2bc] bg-white px-3 text-sm font-medium"
        type="time"
        value={value}
        required
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

function SaveButton({
  busy,
  onClick,
  disabled = false,
}: {
  busy: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="min-h-11 rounded-full bg-[#3a2a24] px-5 text-sm font-semibold text-white shadow-[0_4px_0_#1f1612] disabled:opacity-50 active:translate-y-0.5 active:shadow-none"
      disabled={busy || disabled}
      onClick={onClick}
    >
      {busy ? "သိမ်းနေတယ်…" : "သိမ်းမယ်"}
    </button>
  );
}

function IconButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  disabled?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full border border-[#f0d2bc] bg-white text-sm font-bold text-[#3a2a24] disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function CupIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M7 8h8v6a4 4 0 0 1-8 0zM15 10h2a2 2 0 0 1 0 4h-2M8 20h6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M15 3a8 8 0 1 0 6 13 7 7 0 0 1-6-13z" />
    </svg>
  );
}
