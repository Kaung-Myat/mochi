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

const timestamps = { createdAt: new Date(), updatedAt: new Date() };
const hydration = {
  type: "hydration",
  label: "Water",
  enabled: true,
  mode: "interval",
  startLocalTime: "08:00",
  endLocalTime: "20:00",
  intervalMinutes: 120,
  dailyTargetGlasses: 8,
  millilitersPerGlass: 250,
  ...timestamps,
};

describe("routine and daily event rules", () => {
  it("allows an owner to manage a valid routine", async () => {
    const database = testEnvironment!.authenticatedContext("owner").firestore();
    const reference = doc(database, "users/owner/routines/hydration");
    await assertSucceeds(setDoc(reference, hydration));
    await assertSucceeds(getDoc(reference));
    await assertSucceeds(deleteDoc(reference));
  });

  it("denies another user and invalid targets", async () => {
    const other = testEnvironment!.authenticatedContext("other").firestore();
    await assertFails(getDoc(doc(other, "users/owner/routines/hydration")));
    await assertFails(
      setDoc(doc(other, "users/other/routines/hydration"), {
        ...hydration,
        dailyTargetGlasses: 100,
      }),
    );
  });

  it("allows idempotent owner events and rejects mismatched request IDs", async () => {
    const database = testEnvironment!.authenticatedContext("owner").firestore();
    const valid = {
      type: "water",
      routineId: "hydration",
      occurredAt: new Date(),
      clientRequestId: "request-1",
      ...timestamps,
    };
    await assertSucceeds(
      setDoc(doc(database, "users/owner/dailyLogs/2026-11-12/events/request-1"), valid),
    );
    await assertFails(
      setDoc(doc(database, "users/owner/dailyLogs/2026-11-12/events/different"), valid),
    );
  });

  it("rejects oversized private notes", async () => {
    const database = testEnvironment!.authenticatedContext("owner").firestore();
    await assertFails(
      setDoc(doc(database, "users/owner/dailyLogs/2026-11-12/events/meal-1"), {
        type: "meal_completed",
        routineId: "meal-1",
        occurredAt: new Date(),
        clientRequestId: "meal-1",
        note: "x".repeat(201),
        ...timestamps,
      }),
    );
  });
});
