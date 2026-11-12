import { describe, expect, it } from "vitest";
import { generateOccurrences, isInQuietHours } from "./schedule";

describe("reminder schedule generation", () => {
  it("generates hydration times in the saved timezone", () => {
    const results = generateOccurrences(
      {
        type: "hydration",
        enabled: true,
        startLocalTime: "08:00",
        endLocalTime: "12:00",
        intervalMinutes: 120,
      },
      "Asia/Yangon",
      new Date("2026-11-12T00:00:00.000Z"),
      1,
    );
    expect(results.map((value) => value.scheduledFor.toISOString())).toEqual([
      "2026-11-12T01:30:00.000Z",
      "2026-11-12T03:30:00.000Z",
      "2026-11-12T05:30:00.000Z",
    ]);
  });

  it("supports midnight-crossing quiet hours", () => {
    expect(
      isInQuietHours(new Date("2026-11-12T16:00:00.000Z"), "Asia/Yangon", "21:00", "07:00"),
    ).toBe(true);
    expect(
      isInQuietHours(new Date("2026-11-12T06:00:00.000Z"), "Asia/Yangon", "21:00", "07:00"),
    ).toBe(false);
  });

  it("keeps daily local time stable through daylight-saving changes", () => {
    const results = generateOccurrences(
      { type: "meal", enabled: true, localTime: "08:00" },
      "America/New_York",
      new Date("2026-10-31T00:00:00.000Z"),
      5,
    );
    expect(results.map((value) => value.scheduledFor.toISOString())).toEqual([
      "2026-10-31T12:00:00.000Z",
      "2026-11-01T13:00:00.000Z",
      "2026-11-02T13:00:00.000Z",
      "2026-11-03T13:00:00.000Z",
    ]);
  });
});
