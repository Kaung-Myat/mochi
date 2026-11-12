import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

let testEnvironment: RulesTestEnvironment | undefined;

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: "demo-mochi",
    firestore: { rules: readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8") },
  });
});

afterAll(async () => testEnvironment?.cleanup());

const profile = (uid: string) => ({
  uid,
  displayName: "Mochi friend",
  timezone: "Asia/Yangon",
  locale: "my",
  onboardingVersion: 1,
  onboardingCompletedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("profile rules", () => {
  it("allows an owner to create a valid profile", async () => {
    const database = testEnvironment!.authenticatedContext("user-a").firestore();
    await assertSucceeds(setDoc(doc(database, "users/user-a"), profile("user-a")));
  });

  it("denies reading another person’s profile", async () => {
    const database = testEnvironment!.authenticatedContext("user-b").firestore();
    await assertFails(getDoc(doc(database, "users/user-a")));
  });

  it("denies oversized display names", async () => {
    const database = testEnvironment!.authenticatedContext("user-c").firestore();
    await assertFails(
      setDoc(doc(database, "users/user-c"), { ...profile("user-c"), displayName: "x".repeat(41) }),
    );
  });

  it("denies unauthenticated access", async () => {
    const database = testEnvironment!.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(database, "users/user-a")));
    expect(true).toBe(true);
  });
});
