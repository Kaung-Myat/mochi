import { describe, expect, it } from "vitest";
import { detectTimezone, profileSchema } from "./schema";

describe("profile schema", () => {
  it("accepts a valid completed onboarding profile", () => {
    expect(
      profileSchema.parse({ timezone: "Asia/Yangon", locale: "my", onboardingVersion: 1 }),
    ).toMatchObject({ timezone: "Asia/Yangon" });
  });

  it("limits a nickname to a gentle, bounded field", () => {
    expect(() =>
      profileSchema.parse({
        displayName: "x".repeat(41),
        timezone: "UTC",
        locale: "en",
        onboardingVersion: 1,
      }),
    ).toThrow();
  });

  it("always has a timezone fallback", () => {
    expect(detectTimezone()).toBeTruthy();
  });
});
