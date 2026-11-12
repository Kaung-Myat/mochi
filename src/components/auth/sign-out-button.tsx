"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    const { getFirebaseClient } = await import("@/lib/firebase/client");
    const { auth } = getFirebaseClient();
    if (auth.currentUser) {
      const { disableNotifications } = await import("@/lib/reminders/repository");
      try {
        await disableNotifications(auth.currentUser.uid);
      } catch {
        // Signing out must still succeed if push cleanup is temporarily offline.
      }
    }
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    router.replace("/auth/sign-in");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleSignOut} disabled={isPending}>
      {isPending ? "အကောင့်မှ ထွက်နေတယ်…" : "အကောင့်မှ ထွက်မယ်"}
    </button>
  );
}
