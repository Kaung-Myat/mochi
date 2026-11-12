"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export type AuthStatus = "loading" | "ready" | "configuration-error";

export function useAuthState(): { status: AuthStatus; user: User | null } {
  const [status, setStatus] = useState<AuthStatus>(
    isFirebaseConfigured ? "loading" : "configuration-error",
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let unsubscribe: (() => void) | undefined;
    void import("@/lib/firebase/client").then(({ getFirebaseClient }) => {
      const { auth } = getFirebaseClient();
      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        setStatus("ready");
      });
    });

    return () => unsubscribe?.();
  }, []);

  return { status, user };
}
