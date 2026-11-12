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

const timestamps = {
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSeenAt: new Date(),
};
const device = {
  fcmToken: "private-fcm-token-value-long-enough",
  platform: "web",
  permission: "granted",
  userAgentSummary: "Chrome on Linux",
  enabled: true,
  ...timestamps,
};
const preferences = {
  enabled: true,
  hydrationEnabled: true,
  mealsEnabled: true,
  sleepEnabled: true,
  quietHoursEnabled: true,
  quietStartLocalTime: "21:00",
  quietEndLocalTime: "07:00",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("reminder security rules", () => {
  it("allows an owner to manage a valid random-ID device registration", async () => {
    const database = testEnvironment!.authenticatedContext("owner").firestore();
    const reference = doc(database, "users/owner/devices/8da28ee3-6dca-443c-91c7-556fd7d750bf");
    await assertSucceeds(setDoc(reference, device));
    await assertSucceeds(getDoc(reference));
    await assertSucceeds(setDoc(reference, { ...device, enabled: false }));
    await assertSucceeds(deleteDoc(reference));
  });

  it("keeps device tokens private from every other user", async () => {
    const owner = testEnvironment!.authenticatedContext("owner-a").firestore();
    const other = testEnvironment!.authenticatedContext("other").firestore();
    const path = "users/owner-a/devices/1f44b14f-9639-498a-9b4e-bf9fa259fa2b";
    await assertSucceeds(setDoc(doc(owner, path), device));
    await assertFails(getDoc(doc(other, path)));
    await assertFails(setDoc(doc(other, path), device));
  });

  it("rejects malformed tokens, excess fields, and changed creation timestamps", async () => {
    const database = testEnvironment!.authenticatedContext("owner-b").firestore();
    const reference = doc(database, "users/owner-b/devices/f544c720-446e-47c2-8ae1-fd27a645da20");
    await assertFails(setDoc(reference, { ...device, fcmToken: "short" }));
    await assertFails(setDoc(reference, { ...device, privateNote: "must not be stored" }));
    await assertSucceeds(setDoc(reference, device));
    await assertFails(setDoc(reference, { ...device, createdAt: new Date(0) }));
  });

  it("allows valid preferences and rejects invalid quiet hours", async () => {
    const database = testEnvironment!.authenticatedContext("owner-c").firestore();
    const reference = doc(database, "users/owner-c/reminderSettings/preferences");
    await assertSucceeds(setDoc(reference, preferences));
    await assertSucceeds(getDoc(reference));
    await assertFails(setDoc(reference, { ...preferences, quietStartLocalTime: "25:00" }));
  });

  it("keeps reminder occurrences server-owned", async () => {
    const database = testEnvironment!.authenticatedContext("owner-d").firestore();
    const reference = doc(database, "users/owner-d/reminderOccurrences/occurrence-1");
    await testEnvironment!.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), reference.path), {
        routineId: "hydration",
        category: "hydration",
        scheduledFor: new Date(),
        status: "pending",
        attemptCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    await assertSucceeds(getDoc(reference));
    await assertFails(setDoc(reference, { status: "sent" }, { merge: true }));
  });
});
