import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase/client";
import { eventTypeSchema, type DailyEvent, type DailyEventType } from "./events";
import { routineSchema, type Routine } from "./schema";

export function subscribeRoutines(
  uid: string,
  onValue: (routines: Routine[], syncing: boolean) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const { db } = getFirebaseClient();
  return onSnapshot(
    collection(db, "users", uid, "routines"),
    { includeMetadataChanges: true },
    (snapshot) => {
      const routines = snapshot.docs.flatMap((routineDoc) => {
        const result = routineSchema.safeParse({ id: routineDoc.id, ...routineDoc.data() });
        return result.success ? [result.data] : [];
      });
      onValue(routines, snapshot.metadata.hasPendingWrites);
    },
    onError,
  );
}

export async function saveRoutine(uid: string, routine: Routine): Promise<void> {
  const value = routineSchema.parse(routine);
  const { id, ...data } = value;
  const { db } = getFirebaseClient();
  await setDoc(
    doc(db, "users", uid, "routines", id),
    { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true },
  );
  void refreshRemindersAfterRoutineChange();
}

export async function saveRoutines(uid: string, routines: Routine[]): Promise<void> {
  const { db } = getFirebaseClient();
  const batch = writeBatch(db);
  for (const routine of routines.map((value) => routineSchema.parse(value))) {
    const { id, ...data } = routine;
    batch.set(
      doc(db, "users", uid, "routines", id),
      { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
      { merge: true },
    );
  }
  await batch.commit();
  void refreshRemindersAfterRoutineChange();
}

export async function removeRoutine(uid: string, routineId: string): Promise<void> {
  const { db } = getFirebaseClient();
  await deleteDoc(doc(db, "users", uid, "routines", routineId));
  void refreshRemindersAfterRoutineChange();
}

async function refreshRemindersAfterRoutineChange() {
  const { refreshReminderSchedule } = await import("@/lib/reminders/repository");
  await refreshReminderSchedule().catch(() => undefined);
}

export function subscribeDailyEvents(
  uid: string,
  localDate: string,
  onValue: (events: DailyEvent[], syncing: boolean) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const { db } = getFirebaseClient();
  return onSnapshot(
    collection(db, "users", uid, "dailyLogs", localDate, "events"),
    { includeMetadataChanges: true },
    (snapshot) => {
      const events = snapshot.docs.flatMap((eventDoc) => {
        const data = eventDoc.data({ serverTimestamps: "estimate" });
        const type = eventTypeSchema.safeParse(data.type);
        if (!type.success || !(data.occurredAt instanceof Timestamp)) return [];
        return [
          {
            id: eventDoc.id,
            type: type.data,
            routineId: typeof data.routineId === "string" ? data.routineId : undefined,
            occurredAt: data.occurredAt.toDate(),
            clientRequestId: String(data.clientRequestId),
            note: typeof data.note === "string" ? data.note : undefined,
          } satisfies DailyEvent,
        ];
      });
      events.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
      onValue(events, snapshot.metadata.hasPendingWrites);
    },
    onError,
  );
}

export async function logDailyEvent(
  uid: string,
  localDate: string,
  input: { id?: string; type: DailyEventType; routineId?: string; note?: string },
): Promise<string> {
  const { db } = getFirebaseClient();
  const id = input.id ?? crypto.randomUUID();
  const eventRef = doc(db, "users", uid, "dailyLogs", localDate, "events", id);
  await setDoc(eventRef, {
    type: eventTypeSchema.parse(input.type),
    ...(input.routineId ? { routineId: input.routineId } : {}),
    ...(input.note?.trim() ? { note: input.note.trim() } : {}),
    occurredAt: serverTimestamp(),
    clientRequestId: id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function removeDailyEvent(uid: string, localDate: string, eventId: string) {
  const { db } = getFirebaseClient();
  await deleteDoc(doc(db, "users", uid, "dailyLogs", localDate, "events", eventId));
}
