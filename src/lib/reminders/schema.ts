import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const deviceRegistrationSchema = z.object({
  id: z.string().uuid(),
  fcmToken: z.string().min(20).max(4096),
  platform: z.literal("web"),
  permission: z.literal("granted"),
  userAgentSummary: z.string().min(1).max(160).optional(),
  enabled: z.boolean(),
});

export const reminderPreferencesSchema = z.object({
  enabled: z.boolean(),
  hydrationEnabled: z.boolean(),
  mealsEnabled: z.boolean(),
  sleepEnabled: z.boolean(),
  quietHoursEnabled: z.boolean(),
  quietStartLocalTime: z.string().regex(timePattern),
  quietEndLocalTime: z.string().regex(timePattern),
});

export type ReminderPreferences = z.infer<typeof reminderPreferencesSchema>;

export const defaultReminderPreferences: ReminderPreferences = {
  enabled: true,
  hydrationEnabled: true,
  mealsEnabled: true,
  sleepEnabled: true,
  quietHoursEnabled: true,
  quietStartLocalTime: "21:00",
  quietEndLocalTime: "07:00",
};
