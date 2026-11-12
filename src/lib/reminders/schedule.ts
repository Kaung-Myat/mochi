import { DateTime } from "luxon";

export type ReminderCategory = "hydration" | "meal" | "sleep";
export type ReminderKind = "hydration" | "meal" | "wind-down" | "wake";

export interface RoutineRecord {
  type: ReminderCategory;
  enabled: boolean;
  startLocalTime?: string;
  endLocalTime?: string;
  intervalMinutes?: number;
  localTime?: string;
  bedtimeLocalTime?: string;
  wakeLocalTime?: string;
  windDownMinutes?: number;
}

export interface GeneratedOccurrence {
  kind: ReminderKind;
  scheduledFor: Date;
}

export function generateOccurrences(
  routine: RoutineRecord,
  timezone: string,
  now: Date,
  horizonDays = 14,
): GeneratedOccurrence[] {
  if (!routine.enabled || horizonDays < 1) return [];
  const zonedNow = DateTime.fromJSDate(now, { zone: timezone });
  if (!zonedNow.isValid) return [];

  const occurrences: GeneratedOccurrence[] = [];
  for (let dayOffset = 0; dayOffset < horizonDays; dayOffset += 1) {
    const day = zonedNow.startOf("day").plus({ days: dayOffset });
    if (routine.type === "hydration") {
      const start = atLocalTime(day, routine.startLocalTime);
      let end = atLocalTime(day, routine.endLocalTime);
      const interval = routine.intervalMinutes ?? 0;
      if (!start || !end || interval < 30 || interval > 480) continue;
      if (end <= start) end = end.plus({ days: 1 });
      for (
        let candidate = start;
        candidate <= end;
        candidate = candidate.plus({ minutes: interval })
      ) {
        addIfFuture(occurrences, "hydration", candidate, now);
      }
    } else if (routine.type === "meal") {
      const meal = atLocalTime(day, routine.localTime);
      if (meal) addIfFuture(occurrences, "meal", meal, now);
    } else {
      const bedtime = atLocalTime(day, routine.bedtimeLocalTime);
      const wake = atLocalTime(day, routine.wakeLocalTime);
      if (bedtime) {
        addIfFuture(
          occurrences,
          "wind-down",
          bedtime.minus({ minutes: routine.windDownMinutes ?? 0 }),
          now,
        );
      }
      if (wake) addIfFuture(occurrences, "wake", wake, now);
    }
  }
  return occurrences;
}

export function isInQuietHours(
  instant: Date,
  timezone: string,
  startLocalTime: string,
  endLocalTime: string,
): boolean {
  const local = DateTime.fromJSDate(instant, { zone: timezone });
  if (!local.isValid) return false;
  const currentMinutes = local.hour * 60 + local.minute;
  const start = parseMinutes(startLocalTime);
  const end = parseMinutes(endLocalTime);
  if (start === null || end === null || start === end) return false;
  return start < end
    ? currentMinutes >= start && currentMinutes < end
    : currentMinutes >= start || currentMinutes < end;
}

function atLocalTime(day: DateTime, value: string | undefined): DateTime | null {
  const minutes = value ? parseMinutes(value) : null;
  if (minutes === null) return null;
  return day.set({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
}

function parseMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function addIfFuture(
  output: GeneratedOccurrence[],
  kind: ReminderKind,
  value: DateTime,
  now: Date,
) {
  if (value.isValid && value.toMillis() >= now.getTime()) {
    output.push({ kind, scheduledFor: value.toUTC().toJSDate() });
  }
}
