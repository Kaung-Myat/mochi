import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const routineBase = z.object({
  id: z.string().min(1).max(80),
  label: z.string().trim().min(1).max(40),
  enabled: z.boolean(),
});

export const hydrationRoutineSchema = routineBase.extend({
  id: z.literal("hydration"),
  type: z.literal("hydration"),
  mode: z.enum(["interval", "times"]),
  startLocalTime: z.string().regex(timePattern),
  endLocalTime: z.string().regex(timePattern),
  intervalMinutes: z.number().int().min(30).max(480),
  dailyTargetGlasses: z.number().int().min(1).max(30),
  millilitersPerGlass: z.number().int().min(50).max(2000),
});

export const mealRoutineSchema = routineBase.extend({
  type: z.literal("meal"),
  localTime: z.string().regex(timePattern),
  sortOrder: z.number().int().min(0).max(50),
});

export const sleepRoutineSchema = routineBase.extend({
  id: z.literal("sleep"),
  type: z.literal("sleep"),
  bedtimeLocalTime: z.string().regex(timePattern),
  wakeLocalTime: z.string().regex(timePattern),
  windDownMinutes: z.number().int().min(0).max(180),
});

export const routineSchema = z.discriminatedUnion("type", [
  hydrationRoutineSchema,
  mealRoutineSchema,
  sleepRoutineSchema,
]);

export type HydrationRoutine = z.infer<typeof hydrationRoutineSchema>;
export type MealRoutine = z.infer<typeof mealRoutineSchema>;
export type SleepRoutine = z.infer<typeof sleepRoutineSchema>;
export type Routine = z.infer<typeof routineSchema>;

export const defaultHydrationRoutine: HydrationRoutine = {
  id: "hydration",
  type: "hydration",
  label: "ရေသောက်ခြင်း",
  enabled: true,
  mode: "interval",
  startLocalTime: "08:00",
  endLocalTime: "20:00",
  intervalMinutes: 120,
  dailyTargetGlasses: 8,
  millilitersPerGlass: 250,
};

export const defaultSleepRoutine: SleepRoutine = {
  id: "sleep",
  type: "sleep",
  label: "အိပ်စက်ချိန်",
  enabled: true,
  bedtimeLocalTime: "23:00",
  wakeLocalTime: "07:00",
  windDownMinutes: 30,
};

export const defaultMeals: MealRoutine[] = [
  {
    id: "meal-breakfast",
    type: "meal",
    label: "မနက်စာ",
    enabled: true,
    localTime: "08:00",
    sortOrder: 0,
  },
  {
    id: "meal-lunch",
    type: "meal",
    label: "နေ့လယ်စာ",
    enabled: true,
    localTime: "12:30",
    sortOrder: 1,
  },
  {
    id: "meal-dinner",
    type: "meal",
    label: "ညစာ",
    enabled: true,
    localTime: "19:00",
    sortOrder: 2,
  },
];

const defaultLabelTranslations: Record<string, string> = {
  Water: "ရေသောက်ခြင်း",
  Sleep: "အိပ်စက်ချိန်",
  Breakfast: "မနက်စာ",
  Lunch: "နေ့လယ်စာ",
  Dinner: "ညစာ",
  Meal: "အစားအစာ",
};

export function localizedRoutineLabel(label: string): string {
  return defaultLabelTranslations[label] ?? label;
}
