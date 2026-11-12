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
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <p className="text-sm font-medium tracking-wide text-stone-600">MOCHI</p>
      <h1 className="mt-3 text-4xl font-semibold">မင်းရဲ့ ကိုယ်ပိုင်နေရာလေး</h1>
      <p className="mt-4 leading-7 text-stone-700">
        မင်းရဲ့နေ့စဉ်အစီအစဉ်တွေကို လုံခြုံစွာသိမ်းထားပြီး စက်တိုင်းမှာ ပြန်ကြည့်နိုင်ဖို့
        အကောင့်ဝင်ပေးပါ။
      </p>
      <button
        className="mt-8 min-h-11 rounded-full bg-stone-900 px-5 py-3 text-white disabled:opacity-50"
        type="button"
        onClick={signInWithGoogle}
        disabled={isPending}
      >
        Google နဲ့ ဆက်သွားမယ်
      </button>
      <div className="my-7 border-t border-stone-300" />
      <form className="grid gap-4" onSubmit={submit}>
        <label className="grid gap-1">
          အီးမေးလ်
          <input
            className="min-h-11 rounded-lg border border-stone-400 bg-white px-3"
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
            className="min-h-11 rounded-lg border border-stone-400 bg-white px-3"
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
          className="min-h-11 rounded-full border border-stone-800 px-5 py-3 disabled:opacity-50"
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
        className="mt-5 w-fit text-sm underline"
        type="button"
        onClick={() => setMode(mode === "sign-in" ? "create-account" : "sign-in")}
      >
        {mode === "sign-in" ? "အကောင့်အသစ် ဖွင့်မယ်" : "အကောင့်ရှိပြီးသားပါ"}
      </button>
      <p className="mt-6 text-sm leading-6 text-stone-600">
        မင်းရဲ့ နေ့စဉ်အစီအစဉ်နဲ့ ဗိုက်အခြေအနေမှတ်စုတွေကို Mochi က ဘယ်သူ့ကိုမှ မမျှဝေပါဘူး။
      </p>
    </main>
  );
}
