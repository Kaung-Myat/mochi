"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
import { SetupMessage } from "@/components/auth/require-auth";

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
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10"
      aria-busy="true"
    >
      <p className="text-sm font-medium tracking-wide text-stone-600">MOCHI</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        မင်းရဲ့နေရာလေးကို ဖွင့်ပေးနေတယ်…
      </h1>
      <p className="mt-4 text-stone-700">ခဏလေး စောင့်ပေးနော်။</p>
    </main>
  );
}
