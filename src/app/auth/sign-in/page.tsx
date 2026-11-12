"use client";

import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { MochiMascot } from "@/components/mascot/mochi-mascot";
import { SetupMessage } from "@/components/auth/require-auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";

function readableAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/invalid-credential")
      return "အီးမေးလ် သို့မဟုတ် စကားဝှက် မမှန်သေးဘူးနော်။";
    if (error.code === "auth/popup-closed-by-user")
      return "Google နဲ့ဝင်တဲ့ window ကို မပြီးခင် ပိတ်လိုက်ပါတယ်။";
  }
  return "Mochi က အကောင့်ဝင်မပေးနိုင်သေးဘူး။ ခဏနေ ပြန်စမ်းကြည့်ပေးနော်။";
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "create-account">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (!isFirebaseConfigured) return <SetupMessage />;

  async function finishSignIn() {
    router.replace("/onboarding");
  }

  async function signInWithGoogle() {
    setError(null);
    setIsPending(true);
    try {
      const { getFirebaseClient } = await import("@/lib/firebase/client");
      const { auth } = getFirebaseClient();
      await signInWithPopup(auth, new GoogleAuthProvider());
      await finishSignIn();
    } catch (cause) {
      setError(readableAuthError(cause));
    } finally {
      setIsPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const { getFirebaseClient } = await import("@/lib/firebase/client");
      const { auth } = getFirebaseClient();
      if (mode === "create-account") {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      await finishSignIn();
    } catch (cause) {
      setError(readableAuthError(cause));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="auth-game-page mx-auto flex min-h-dvh max-w-md flex-col px-5 py-6">
      <div className="text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-rose-800/60">MOCHI &amp; YOU</p>
        <MochiMascot className="mochi-idle mx-auto -my-2 w-48" />
        <div className="mx-auto -mt-2 max-w-xs rounded-[1.6rem] border border-white/80 bg-white/70 px-5 py-3 shadow-[0_16px_40px_rgba(80,45,40,0.1)] backdrop-blur">
          <h1 className="text-2xl font-semibold">မင်းပြန်လာပြီလား</h1>
          <p className="mt-1 text-sm text-stone-600">Mochi က ဒီမှာ စောင့်နေတာနော်။</p>
        </div>
      </div>
      <div className="mt-5 rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-[0_20px_50px_rgba(80,45,40,0.11)] backdrop-blur">
        <button
          className="min-h-12 w-full rounded-full bg-rose-600 px-5 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
          type="button"
          onClick={signInWithGoogle}
          disabled={isPending}
        >
          Google နဲ့ ဆက်သွားမယ်
        </button>
        <div className="my-5 flex items-center gap-3 text-xs text-stone-400 before:h-px before:flex-1 before:bg-rose-200 after:h-px after:flex-1 after:bg-rose-200">
          သို့မဟုတ်
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          <label className="grid gap-1">
            အီးမေးလ်
            <input
              className="min-h-11 rounded-2xl border border-rose-200 bg-white/80 px-4"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="grid gap-1">
            စကားဝှက်
            <input
              className="min-h-11 rounded-2xl border border-rose-200 bg-white/80 px-4"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
          <button
            className="min-h-11 rounded-full border border-rose-300 bg-rose-50 px-5 py-3 font-semibold text-rose-950 disabled:opacity-50"
            disabled={isPending}
          >
            {isPending
              ? "ခဏလေး စောင့်ပေးနော်…"
              : mode === "create-account"
                ? "အကောင့်ဖွင့်မယ်"
                : "အကောင့်ဝင်မယ်"}
          </button>
        </form>
        <button
          className="mt-4 w-fit text-sm font-semibold text-rose-800 underline"
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "create-account" : "sign-in")}
        >
          {mode === "sign-in" ? "အကောင့်အသစ် ဖွင့်မယ်" : "အကောင့်ရှိပြီးသားပါ"}
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-stone-500">
        မင်းရဲ့ diary နဲ့ နေ့စဉ်အစီအစဉ်တွေကို Mochi က ဘယ်သူ့ကိုမှ မပြောပါဘူး။
      </p>
    </main>
  );
}
