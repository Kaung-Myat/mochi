import { describe, expect, it } from "vitest";
import { localDateKey, sleepDurationMinutes } from "./date";
import { defaultHydrationRoutine, hydrationRoutineSchema, routineSchema } from "./schema";

describe("routine domain", () => {
  it("accepts the editable hydration example", () => {
    expect(hydrationRoutineSchema.parse(defaultHydrationRoutine).dailyTargetGlasses).toBe(8);
  });

  it("rejects invalid local times and extreme targets", () => {
    expect(() =>
      routineSchema.parse({ ...defaultHydrationRoutine, startLocalTime: "25:00" }),
    ).toThrow();
    expect(() =>
      routineSchema.parse({ ...defaultHydrationRoutine, dailyTargetGlasses: 31 }),
    ).toThrow();
  });

  it("handles sleep schedules that cross midnight", () => {
    expect(sleepDurationMinutes("23:00", "07:00")).toBe(480);
  });

  it("creates a stable date key in the saved timezone", () => {
    expect(localDateKey(new Date("2026-01-01T18:00:00.000Z"), "Asia/Yangon")).toBe("2026-01-02");
  });
});
