import { authenticatedUid, reminderErrorResponse } from "@/lib/reminders/server-auth";
import { deactivateReminderUserIfUnused } from "@/lib/reminders/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const uid = await authenticatedUid(request);
    const active = await deactivateReminderUserIfUnused(uid);
    return Response.json({ active });
  } catch (error) {
    return reminderErrorResponse(error);
  }
}
