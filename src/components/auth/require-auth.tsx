"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "./auth-provider";
import { MochiMascot } from "@/components/mascot/mochi-mascot";

export function RequireAuth({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { status, user } = useAuthState();

  useEffect(() => {
    if (status === "ready" && !user) router.replace("/auth/sign-in");
  }, [router, status, user]);

  if (status === "configuration-error") {
    return <SetupMessage />;
  }

  if (status === "loading" || !user) {
    return (
      <main
        className="auth-game-page mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-12 text-center"
        aria-busy="true"
      >
        <MochiMascot className="mochi-idle w-40" />
        <p className="mt-3 font-semibold">Mochi နိုးလာနေတယ်…</p>
      </main>
    );
  }

  return <>{children}</>;
}

export function SetupMessage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-3xl font-semibold">Mochi ကို နည်းနည်းပြင်ဆင်ပေးရဦးမယ်</h1>
      <p className="mt-4 leading-7 text-stone-700">
        Firebase Web app တန်ဖိုးတွေကို <code>.env.local</code> ထဲထည့်ပြီး app ကို ပြန်ဖွင့်ပေးပါ။
        ချိတ်ဆက်မှုမပြီးသေးခင် ကိုယ်ရေးအချက်အလက်တွေကို ဖွင့်ကြည့်လို့မရသေးပါဘူး။
      </p>
    </main>
  );
}
