import "server-only";

import { getAdminAuth } from "@/lib/firebase/admin";
import { ReminderServerError } from "./server";

export async function authenticatedUid(request: Request): Promise<string> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) throw new ReminderServerError("unauthenticated", 401);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new ReminderServerError("unauthenticated", 401);
  }
}

export function reminderErrorResponse(error: unknown): Response {
  if (error instanceof ReminderServerError) {
    return Response.json({ error: error.code }, { status: error.status });
  }
  console.error("Reminder endpoint failed", { code: "internal" });
  return Response.json({ error: "internal" }, { status: 500 });
}
