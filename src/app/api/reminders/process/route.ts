import { Receiver } from "@upstash/qstash";
import { processDueReminders } from "@/lib/reminders/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!currentSigningKey || !nextSigningKey) {
    return Response.json({ error: "scheduler-not-configured" }, { status: 503 });
  }

  const signature = request.headers.get("upstash-signature");
  if (!signature) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    const receiver = new Receiver({ currentSigningKey, nextSigningKey });
    const body = await request.text();
    await receiver.verify({ signature, body, url: request.url, clockTolerance: 5 });
  } catch {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const processed = await processDueReminders();
    return Response.json({ processed });
  } catch {
    console.error("Scheduled reminder processing failed", { code: "internal" });
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
