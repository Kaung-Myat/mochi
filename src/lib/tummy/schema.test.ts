import { describe, expect, it } from "vitest";
import { tummyEntryInputSchema } from "./schema";

const validEntry = {
  occurredAt: new Date("2026-11-12T00:00:00.000Z"),
  timezone: "Asia/Yangon",
  intensity: 4,
  symptoms: ["bloating"] as const,
};

describe("tummy entry schema", () => {
  it("accepts a small private journal entry", () => {
    expect(tummyEntryInputSchema.parse(validEntry).intensity).toBe(4);
  });

  it("requires a valid personal intensity and at least one symptom tag", () => {
    expect(() => tummyEntryInputSchema.parse({ ...validEntry, intensity: 11 })).toThrow();
    expect(() => tummyEntryInputSchema.parse({ ...validEntry, symptoms: [] })).toThrow();
  });

  it("limits free text and duration", () => {
    expect(() => tummyEntryInputSchema.parse({ ...validEntry, note: "x".repeat(501) })).toThrow();
    expect(() => tummyEntryInputSchema.parse({ ...validEntry, durationMinutes: 0 })).toThrow();
  });
});
