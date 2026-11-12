import { authenticatedUid, reminderErrorResponse } from "@/lib/reminders/server-auth";
import { sendTestReminder } from "@/lib/reminders/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const uid = await authenticatedUid(request);
    const delivered = await sendTestReminder(uid);
    return Response.json({ delivered });
  } catch (error) {
    return reminderErrorResponse(error);
  }
}
