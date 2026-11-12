import { authenticatedUid, reminderErrorResponse } from "@/lib/reminders/server-auth";
import { refreshReminderSchedule } from "@/lib/reminders/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const uid = await authenticatedUid(request);
    await refreshReminderSchedule(uid);
    return Response.json({ scheduled: true });
  } catch (error) {
    return reminderErrorResponse(error);
  }
}
