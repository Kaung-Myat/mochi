import { z } from "zod";

export const eventTypeSchema = z.enum([
  "water",
  "meal_completed",
  "meal_skipped",
  "bedtime_logged",
  "wake_logged",
]);

export type DailyEventType = z.infer<typeof eventTypeSchema>;
export interface DailyEvent {
  id: string;
  type: DailyEventType;
  routineId?: string;
  occurredAt: Date;
  clientRequestId: string;
  note?: string;
}
