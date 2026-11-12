export function localDateKey(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function sleepDurationMinutes(bedtime: string, wakeTime: string): number {
  const toMinutes = (time: string) => {
    const [hours = 0, minutes = 0] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const start = toMinutes(bedtime);
  const end = toMinutes(wakeTime);
  return end >= start ? end - start : 24 * 60 - start + end;
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "မင်္ဂလာနံနက်ခင်းပါ";
  if (hour < 18) return "မင်္ဂလာနေ့လယ်ခင်းပါ";
  return "မင်္ဂလာညနေခင်းပါ";
}
