import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

let testEnvironment: RulesTestEnvironment | undefined;

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: "demo-mochi",
    firestore: { rules: readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8") },
  });
});

afterAll(async () => testEnvironment?.cleanup());

const entry = {
  occurredAt: new Date(),
  timezone: "Asia/Yangon",
  intensity: 4,
  symptoms: ["bloating", "gas"],
  location: "all_over",
  durationMinutes: 30,
  mealRelation: "unsure",
  moodOrEnergy: "ပင်ပန်းနေတယ်",
  note: "ကိုယ်ပိုင်မှတ်စုတို",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("tummy journal rules", () => {
  it("allows an owner to create, read, update, and delete a valid entry", async () => {
    const database = testEnvironment!.authenticatedContext("owner").firestore();
    const reference = doc(database, "users/owner/tummyEntries/entry-1");
    await assertSucceeds(setDoc(reference, entry));
    await assertSucceeds(getDoc(reference));
    await assertSucceeds(setDoc(reference, { ...entry, intensity: 5 }));
    await assertSucceeds(deleteDoc(reference));
  });

  it("keeps entries private from other users", async () => {
    const owner = testEnvironment!.authenticatedContext("owner-a").firestore();
    const other = testEnvironment!.authenticatedContext("other").firestore();
    await assertSucceeds(setDoc(doc(owner, "users/owner-a/tummyEntries/private"), entry));
    await assertFails(getDoc(doc(other, "users/owner-a/tummyEntries/private")));
  });

  it("rejects invalid intensity and unknown symptom values", async () => {
    const database = testEnvironment!.authenticatedContext("owner-b").firestore();
    await assertFails(
      setDoc(doc(database, "users/owner-b/tummyEntries/intensity"), {
        ...entry,
        intensity: 11,
      }),
    );
    await assertFails(
      setDoc(doc(database, "users/owner-b/tummyEntries/symptom"), {
        ...entry,
        symptoms: ["diagnosis_value"],
      }),
    );
  });

  it("rejects oversized private text", async () => {
    const database = testEnvironment!.authenticatedContext("owner-c").firestore();
    await assertFails(
      setDoc(doc(database, "users/owner-c/tummyEntries/note"), {
        ...entry,
        note: "x".repeat(501),
      }),
    );
  });
});
