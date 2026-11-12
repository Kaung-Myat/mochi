import { z } from "zod";

export const supportedLocales = ["my", "en"] as const;

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(40).optional(),
  timezone: z.string().trim().min(1).max(100),
  locale: z.enum(supportedLocales),
  onboardingVersion: z.literal(1),
  onboardingCompletedAt: z.date().optional(),
});

export type ProfileInput = z.input<typeof profileSchema>;
export type Profile = z.output<typeof profileSchema>;

export function detectTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
