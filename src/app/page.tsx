"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
import { SetupMessage } from "@/components/auth/require-auth";
import { MochiMascot } from "@/components/mascot/mochi-mascot";

export default function HomePage() {
  const router = useRouter();
  const { status, user } = useAuthState();

  useEffect(() => {
    if (status !== "ready") return;

    router.replace(user ? "/today" : "/auth/sign-in");
  }, [router, status, user]);

  if (status === "configuration-error") {
    return <SetupMessage />;
  }

  return (
    <main
      className="auth-game-page mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-10 text-center"
      aria-busy="true"
    >
      <MochiMascot className="mochi-idle w-48" />
      <p className="mt-2 text-xs font-bold tracking-[0.2em] text-rose-800/60">MOCHI &amp; YOU</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">မင်းဆီကို ပြေးလာနေတယ်…</h1>
      <p className="mt-2 text-sm text-stone-600">ခဏလေး စောင့်ပေးနော်။</p>
    </main>
  );
}
