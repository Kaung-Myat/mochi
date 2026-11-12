import "server-only";

import {
  FieldValue,
  Timestamp,
  type DocumentReference,
  type DocumentSnapshot,
} from "firebase-admin/firestore";
import type { BatchResponse } from "firebase-admin/messaging";
import { getAdminDatabase, getAdminMessaging } from "@/lib/firebase/admin";
import {
  generateOccurrences,
  isInQuietHours,
  type ReminderCategory,
  type RoutineRecord,
} from "./schedule";

const horizonDays = 14;
const graceMinutes = 20;
const maximumAttempts = 3;
const invalidTokenCodes = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

interface ReminderPreferencesRecord {
  enabled: boolean;
  hydrationEnabled: boolean;
  mealsEnabled: boolean;
  sleepEnabled: boolean;
  quietHoursEnabled: boolean;
  quietStartLocalTime: string;
  quietEndLocalTime: string;
}

interface ClaimedOccurrence {
  routineId: string;
  category: ReminderCategory;
  scheduledFor: Timestamp;
  attemptCount: number;
}

const defaultPreferences: ReminderPreferencesRecord = {
  enabled: true,
  hydrationEnabled: true,
  mealsEnabled: true,
  sleepEnabled: true,
  quietHoursEnabled: true,
  quietStartLocalTime: "21:00",
  quietEndLocalTime: "07:00",
};

export async function sendTestReminder(uid: string): Promise<number> {
  await enforceOperationRateLimit(uid, "testNotification", 60_000);
  const devices = await activeDevices(uid);
  if (devices.length === 0) throw new ReminderServerError("no-active-device", 409);

  const response = await getAdminMessaging().sendEachForMulticast({
    tokens: devices.map((device) => String(device.data().fcmToken)),
    data: { link: "/today", occurrenceId: `test-${Date.now()}` },
    webpush: { headers: { Urgency: "high", TTL: "300" }, fcmOptions: { link: "/today" } },
  });
  await removeInvalidDevices(devices, response);
  console.info("Test reminder processed", { uid, delivered: response.successCount });
  if (response.successCount === 0) throw new ReminderServerError("delivery-unavailable", 503);
  return response.successCount;
}

export async function refreshReminderSchedule(uid: string): Promise<void> {
  const database = getAdminDatabase();
  await database.doc(`reminderUsers/${uid}`).set(
    {
      uid,
      active: true,
      lastSeenAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  await regenerateUserSchedule(uid);
}

export async function deactivateReminderUserIfUnused(uid: string): Promise<boolean> {
  const devices = await activeDevices(uid);
  if (devices.length > 0) return true;
  await getAdminDatabase().doc(`reminderUsers/${uid}`).set(
    {
      uid,
      active: false,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return false;
}

async function regenerateUserSchedule(uid: string): Promise<void> {
  const database = getAdminDatabase();
  const routines = await database.collection(`users/${uid}/routines`).get();
  const timezone = await userTimezone(uid);
  const routineIds = new Set(routines.docs.map((routine) => routine.id));
  const obsolete = await database
    .collection(`users/${uid}/reminderOccurrences`)
    .where("scheduledFor", ">=", Timestamp.now())
    .get();
  const cleanup = database.bulkWriter();
  for (const occurrence of obsolete.docs) {
    const data = occurrence.data();
    if (
      !routineIds.has(String(data.routineId)) &&
      ["pending", "processing"].includes(String(data.status))
    ) {
      cleanup.delete(occurrence.ref);
    }
  }
  await cleanup.close();
  await Promise.all(
    routines.docs.map((routine) =>
      regenerateRoutine(uid, routine.id, routine.data() as RoutineRecord, timezone),
    ),
  );
}

export async function processDueReminders(): Promise<number> {
  const database = getAdminDatabase();
  await refillReminderHorizonsIfDue();
  await recoverExpiredLeases();
  const due = await database
    .collectionGroup("reminderOccurrences")
    .where("status", "==", "pending")
    .where("scheduledFor", "<=", Timestamp.now())
    .orderBy("scheduledFor", "asc")
    .limit(100)
    .get();
  await Promise.allSettled(due.docs.map((occurrence) => processOccurrence(occurrence.ref)));
  console.info("Due reminder batch processed", { count: due.size });
  return due.size;
}

async function refillReminderHorizonsIfDue() {
  const database = getAdminDatabase();
  const stateReference = database.doc("reminderScheduler/horizonRefill");
  const claimed = await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(stateReference);
    const data = snapshot.data();
    const lastRefillAt = data?.lastRefillAt as Timestamp | undefined;
    const leaseUntil = data?.leaseUntil as Timestamp | undefined;
    if (lastRefillAt && Date.now() - lastRefillAt.toMillis() < 20 * 60 * 60_000) return false;
    if (leaseUntil && leaseUntil.toMillis() > Date.now()) return false;
    transaction.set(
      stateReference,
      { leaseUntil: Timestamp.fromMillis(Date.now() + 4 * 60_000) },
      { merge: true },
    );
    return true;
  });
  if (!claimed) return;

  try {
    const users = await database
      .collection("reminderUsers")
      .where("active", "==", true)
      .limit(50)
      .get();
    await Promise.all(users.docs.map((user) => regenerateUserSchedule(user.id)));
    await stateReference.set(
      {
        lastRefillAt: FieldValue.serverTimestamp(),
        leaseUntil: FieldValue.delete(),
      },
      { merge: true },
    );
  } catch (error) {
    await stateReference.set({ leaseUntil: FieldValue.delete() }, { merge: true });
    console.error("Reminder horizon refill failed", { code: safeCode(error) });
  }
}

async function regenerateRoutine(
  uid: string,
  routineId: string,
  routine: RoutineRecord,
  timezone: string,
) {
  const database = getAdminDatabase();
  const now = new Date();
  const existing = await database
    .collection(`users/${uid}/reminderOccurrences`)
    .where("routineId", "==", routineId)
    .where("scheduledFor", ">=", Timestamp.fromDate(now))
    .get();
  const writer = database.bulkWriter();
  for (const occurrence of existing.docs) {
    if (["pending", "processing"].includes(String(occurrence.data().status))) {
      writer.delete(occurrence.ref);
    }
  }

  if (routine.enabled) {
    for (const occurrence of generateOccurrences(routine, timezone, now, horizonDays)) {
      const milliseconds = occurrence.scheduledFor.getTime();
      const id = `${safeId(routineId)}-${occurrence.kind}-${milliseconds}`;
      writer.set(database.doc(`users/${uid}/reminderOccurrences/${id}`), {
        routineId,
        category: routine.type,
        kind: occurrence.kind,
        scheduledFor: Timestamp.fromDate(occurrence.scheduledFor),
        status: "pending",
        attemptCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
  await writer.close();
}

async function processOccurrence(reference: DocumentReference) {
  const database = getAdminDatabase();
  const claimed = await database.runTransaction<ClaimedOccurrence | null>(async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists || snapshot.data()?.status !== "pending") return null;
    const data = snapshot.data()!;
    const attemptCount = Number(data.attemptCount ?? 0) + 1;
    transaction.update(reference, {
      status: "processing",
      attemptCount,
      leaseUntil: Timestamp.fromMillis(Date.now() + 2 * 60_000),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return {
      routineId: String(data.routineId ?? ""),
      category: data.category as ReminderCategory,
      scheduledFor: data.scheduledFor as Timestamp,
      attemptCount,
    };
  });
  if (!claimed) return;

  const userReference = reference.parent.parent;
  if (!userReference) return markFailed(reference, "invalid-owner-path");
  const uid = userReference.id;
  if (!(claimed.scheduledFor instanceof Timestamp)) {
    return markFailed(reference, "invalid-schedule");
  }
  if (Date.now() - claimed.scheduledFor.toMillis() > graceMinutes * 60_000) {
    return markSkipped(reference, "expired");
  }

  const [profile, preferencesSnapshot, routineSnapshot, devices] = await Promise.all([
    userReference.get(),
    userReference.collection("reminderSettings").doc("preferences").get(),
    userReference.collection("routines").doc(claimed.routineId).get(),
    activeDevices(uid),
  ]);
  const timezone = typeof profile.data()?.timezone === "string" ? profile.data()!.timezone : "UTC";
  const preferences = parsePreferences(preferencesSnapshot);
  if (!preferences.enabled || !categoryEnabled(preferences, claimed.category)) {
    return markSkipped(reference, "category-disabled");
  }
  if (!routineSnapshot.exists || routineSnapshot.data()?.enabled !== true) {
    return markSkipped(reference, "routine-disabled");
  }
  if (
    preferences.quietHoursEnabled &&
    isInQuietHours(
      new Date(),
      timezone,
      preferences.quietStartLocalTime,
      preferences.quietEndLocalTime,
    )
  ) {
    return markSkipped(reference, "quiet-hours");
  }
  if (devices.length === 0) return markSkipped(reference, "no-active-device");

  try {
    const response = await getAdminMessaging().sendEachForMulticast({
      tokens: devices.map((device) => String(device.data().fcmToken)),
      data: { link: "/today", occurrenceId: reference.id },
      webpush: { headers: { Urgency: "high", TTL: "300" }, fcmOptions: { link: "/today" } },
    });
    await removeInvalidDevices(devices, response);
    if (response.successCount > 0) {
      await reference.update({
        status: "sent",
        processedAt: FieldValue.serverTimestamp(),
        leaseUntil: FieldValue.delete(),
        failureCode: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return;
    }
    await retryOrFail(reference, claimed.attemptCount, "delivery-unavailable");
  } catch (error) {
    console.error("Reminder delivery failed", {
      uid,
      occurrenceId: reference.id,
      code: safeCode(error),
    });
    await retryOrFail(reference, claimed.attemptCount, safeCode(error));
  }
}

async function recoverExpiredLeases() {
  const database = getAdminDatabase();
  const expired = await database
    .collectionGroup("reminderOccurrences")
    .where("status", "==", "processing")
    .where("leaseUntil", "<=", Timestamp.now())
    .limit(100)
    .get();
  const writer = database.bulkWriter();
  for (const occurrence of expired.docs) {
    writer.update(occurrence.ref, {
      status: "pending",
      leaseUntil: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await writer.close();
}

async function activeDevices(uid: string) {
  const snapshot = await getAdminDatabase()
    .collection(`users/${uid}/devices`)
    .where("enabled", "==", true)
    .limit(500)
    .get();
  return snapshot.docs.filter((device) => typeof device.data().fcmToken === "string");
}

async function removeInvalidDevices(devices: DocumentSnapshot[], response: BatchResponse) {
  const writer = getAdminDatabase().bulkWriter();
  let deleted = 0;
  response.responses.forEach((result, index) => {
    if (!result.success && invalidTokenCodes.has(result.error?.code ?? "")) {
      writer.delete(devices[index].ref);
      deleted += 1;
    }
  });
  await writer.close();
  if (deleted > 0) console.info("Invalid notification devices removed", { count: deleted });
}

async function enforceOperationRateLimit(uid: string, operation: string, minimumDelay: number) {
  const database = getAdminDatabase();
  const reference = database.doc(`users/${uid}/reminderOperations/${operation}`);
  await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const lastRunAt = snapshot.data()?.lastRunAt as Timestamp | undefined;
    if (lastRunAt && Date.now() - lastRunAt.toMillis() < minimumDelay) {
      throw new ReminderServerError("rate-limited", 429);
    }
    transaction.set(reference, { lastRunAt: FieldValue.serverTimestamp() }, { merge: true });
  });
}

async function userTimezone(uid: string): Promise<string> {
  const profile = await getAdminDatabase().doc(`users/${uid}`).get();
  const timezone = profile.data()?.timezone;
  return typeof timezone === "string" && timezone.length <= 100 ? timezone : "UTC";
}

function parsePreferences(snapshot: DocumentSnapshot): ReminderPreferencesRecord {
  const value = snapshot.data();
  if (!value) return defaultPreferences;
  return {
    enabled: value.enabled === true,
    hydrationEnabled: value.hydrationEnabled === true,
    mealsEnabled: value.mealsEnabled === true,
    sleepEnabled: value.sleepEnabled === true,
    quietHoursEnabled: value.quietHoursEnabled === true,
    quietStartLocalTime: String(value.quietStartLocalTime ?? "21:00"),
    quietEndLocalTime: String(value.quietEndLocalTime ?? "07:00"),
  };
}

function categoryEnabled(preferences: ReminderPreferencesRecord, category: ReminderCategory) {
  if (category === "hydration") return preferences.hydrationEnabled;
  if (category === "meal") return preferences.mealsEnabled;
  return preferences.sleepEnabled;
}

async function retryOrFail(reference: DocumentReference, attempts: number, code: string) {
  await reference.update({
    status: attempts >= maximumAttempts ? "failed" : "pending",
    failureCode: code.slice(0, 80),
    leaseUntil: FieldValue.delete(),
    ...(attempts >= maximumAttempts ? { processedAt: FieldValue.serverTimestamp() } : {}),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function markSkipped(reference: DocumentReference, code: string) {
  await reference.update({
    status: "skipped",
    failureCode: code,
    leaseUntil: FieldValue.delete(),
    processedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function markFailed(reference: DocumentReference, code: string) {
  await reference.update({
    status: "failed",
    failureCode: code,
    leaseUntil: FieldValue.delete(),
    processedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
}

function safeCode(error: unknown): string {
  if (error instanceof ReminderServerError) return error.code;
  if (typeof error === "object" && error && "code" in error && typeof error.code === "string") {
    return error.code.slice(0, 80);
  }
  return "internal";
}

export class ReminderServerError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
  }
}
