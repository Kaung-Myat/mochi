import {
  collection,
  deleteField,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase/client";
import {
  tummyEntryInputSchema,
  tummyEntrySchema,
  type TummyEntry,
  type TummyEntryInput,
} from "./schema";

function withoutUndefined(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined));
}

function parseEntry(id: string, data: Record<string, unknown>): TummyEntry | null {
  const occurredAt = data.occurredAt;
  if (!(occurredAt instanceof Timestamp)) return null;
  const result = tummyEntrySchema.safeParse({ ...data, id, occurredAt: occurredAt.toDate() });
  return result.success ? result.data : null;
}

export function subscribeTummyEntries(
  uid: string,
  onValue: (entries: TummyEntry[], syncing: boolean) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const { db } = getFirebaseClient();
  return onSnapshot(
    collection(db, "users", uid, "tummyEntries"),
    { includeMetadataChanges: true },
    (snapshot) => {
      const entries = snapshot.docs.flatMap((entryDoc) => {
        const entry = parseEntry(entryDoc.id, entryDoc.data({ serverTimestamps: "estimate" }));
        return entry ? [entry] : [];
      });
      entries.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
      onValue(entries, snapshot.metadata.hasPendingWrites);
    },
    onError,
  );
}

export function subscribeTummyEntry(
  uid: string,
  entryId: string,
  onValue: (entry: TummyEntry | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const { db } = getFirebaseClient();
  return onSnapshot(
    doc(db, "users", uid, "tummyEntries", entryId),
    (snapshot) => onValue(snapshot.exists() ? parseEntry(snapshot.id, snapshot.data()) : null),
    onError,
  );
}

export async function saveTummyEntry(
  uid: string,
  input: TummyEntryInput,
  entryId?: string,
): Promise<string> {
  const entry = tummyEntryInputSchema.parse(input);
  const id = entryId ?? crypto.randomUUID();
  const { db } = getFirebaseClient();
  const entryRef = doc(db, "users", uid, "tummyEntries", id);
  const requiredFields = {
    occurredAt: Timestamp.fromDate(entry.occurredAt),
    timezone: entry.timezone,
    intensity: entry.intensity,
    symptoms: entry.symptoms,
  };

  if (entryId) {
    await updateDoc(entryRef, {
      ...requiredFields,
      location: entry.location ?? deleteField(),
      durationMinutes: entry.durationMinutes ?? deleteField(),
      mealRelation: entry.mealRelation ?? deleteField(),
      moodOrEnergy: entry.moodOrEnergy ?? deleteField(),
      note: entry.note ?? deleteField(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(
      entryRef,
      withoutUndefined({
        ...requiredFields,
        location: entry.location,
        durationMinutes: entry.durationMinutes,
        mealRelation: entry.mealRelation,
        moodOrEnergy: entry.moodOrEnergy,
        note: entry.note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  }
  return id;
}

export async function removeTummyEntry(uid: string, entryId: string): Promise<void> {
  const { db } = getFirebaseClient();
  await deleteDoc(doc(db, "users", uid, "tummyEntries", entryId));
}
