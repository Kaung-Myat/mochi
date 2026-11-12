import { describe, expect, it } from "vitest";
import {
  defaultReminderPreferences,
  deviceRegistrationSchema,
  reminderPreferencesSchema,
} from "./schema";

describe("reminder schemas", () => {
  it("accepts conservative default preferences", () => {
    expect(reminderPreferencesSchema.parse(defaultReminderPreferences)).toEqual(
      defaultReminderPreferences,
    );
  });

  it("rejects malformed quiet hours", () => {
    expect(() =>
      reminderPreferencesSchema.parse({
        ...defaultReminderPreferences,
        quietStartLocalTime: "24:00",
      }),
    ).toThrow();
  });

  it("bounds private device tokens and requires random IDs", () => {
    expect(() =>
      deviceRegistrationSchema.parse({
        id: "token-as-document-id",
        fcmToken: "too-short",
        platform: "web",
        permission: "granted",
        enabled: true,
      }),
    ).toThrow();
  });
});
