import "server-only";

import { FirebaseAdminConfigError, getAdminAuth } from "@/lib/firebase/admin";
import { ReminderServerError } from "./server";

export async function authenticatedUid(request: Request): Promise<string> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) throw new ReminderServerError("unauthenticated", 401);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    if (error instanceof FirebaseAdminConfigError) throw error;
    throw new ReminderServerError("unauthenticated", 401);
  }
}

export function reminderErrorResponse(error: unknown): Response {
  if (error instanceof ReminderServerError) {
    return Response.json({ error: error.code }, { status: error.status });
  }
  if (error instanceof FirebaseAdminConfigError) {
    return Response.json({ error: "admin-not-configured" }, { status: 503 });
  }
  console.error("Reminder endpoint failed", error);
  return Response.json({ error: "internal" }, { status: 500 });
}
