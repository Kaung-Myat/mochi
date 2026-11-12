import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase/client";
import { type ProfileInput, profileSchema } from "./schema";

export async function saveProfile(uid: string, input: ProfileInput): Promise<void> {
  const profile = profileSchema.parse(input);
  const { displayName, onboardingCompletedAt, ...requiredProfile } = profile;
  const { db } = getFirebaseClient();
  const profileRef = doc(db, "users", uid);

  await setDoc(
    profileRef,
    {
      uid,
      ...requiredProfile,
      ...(displayName === undefined ? {} : { displayName }),
      onboardingCompletedAt: onboardingCompletedAt ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
  const { refreshReminderSchedule } = await import("@/lib/reminders/repository");
  await refreshReminderSchedule().catch(() => undefined);
}
