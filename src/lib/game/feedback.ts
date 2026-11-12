export type FeedbackKind = "tap" | "select" | "sheet" | "success" | "soft" | "pet";

export type GameFeedbackPrefs = {
  sound: boolean;
  haptics: boolean;
};

export const GAME_FEEDBACK_STORAGE_KEY = "mochi.gameFeedback.v1";

export const defaultGameFeedbackPrefs: GameFeedbackPrefs = {
  sound: true,
  haptics: true,
};

export function readGameFeedbackPrefs(): GameFeedbackPrefs {
  if (typeof window === "undefined") return defaultGameFeedbackPrefs;
  try {
    const raw = window.localStorage.getItem(GAME_FEEDBACK_STORAGE_KEY);
    if (!raw) return defaultGameFeedbackPrefs;
    const parsed = JSON.parse(raw) as Partial<GameFeedbackPrefs>;
    return {
      sound: parsed.sound ?? true,
      haptics: parsed.haptics ?? true,
    };
  } catch {
    return defaultGameFeedbackPrefs;
  }
}

export function writeGameFeedbackPrefs(prefs: GameFeedbackPrefs) {
  window.localStorage.setItem(GAME_FEEDBACK_STORAGE_KEY, JSON.stringify(prefs));
}

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    duration,
    type = "sine",
    gain = 0.05,
    delay = 0,
    slideTo,
  }: {
    frequency: number;
    duration: number;
    type?: OscillatorType;
    gain?: number;
    delay?: number;
    slideTo?: number;
  },
) {
  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playSound(kind: FeedbackKind) {
  const ctx = getAudioContext();
  if (!ctx) return;
  switch (kind) {
    case "tap":
      tone(ctx, { frequency: 780, duration: 0.05, type: "triangle", gain: 0.035 });
      break;
    case "select":
      tone(ctx, { frequency: 620, duration: 0.07, type: "square", gain: 0.028 });
      tone(ctx, { frequency: 920, duration: 0.06, type: "sine", gain: 0.022, delay: 0.04 });
      break;
    case "sheet":
      tone(ctx, { frequency: 240, duration: 0.14, type: "sine", gain: 0.03, slideTo: 520 });
      break;
    case "success":
      tone(ctx, { frequency: 523, duration: 0.1, type: "sine", gain: 0.04 });
      tone(ctx, { frequency: 659, duration: 0.12, type: "sine", gain: 0.038, delay: 0.08 });
      tone(ctx, { frequency: 784, duration: 0.16, type: "triangle", gain: 0.034, delay: 0.16 });
      break;
    case "soft":
      tone(ctx, { frequency: 420, duration: 0.08, type: "sine", gain: 0.02 });
      break;
    case "pet":
      tone(ctx, { frequency: 360, duration: 0.12, type: "sine", gain: 0.03, slideTo: 520 });
      tone(ctx, { frequency: 680, duration: 0.1, type: "triangle", gain: 0.02, delay: 0.06 });
      break;
  }
}

function playHaptic(kind: FeedbackKind) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  switch (kind) {
    case "tap":
      navigator.vibrate(12);
      break;
    case "select":
      navigator.vibrate(18);
      break;
    case "sheet":
      navigator.vibrate([10, 24, 14]);
      break;
    case "success":
      navigator.vibrate([16, 30, 22, 28, 30]);
      break;
    case "soft":
      navigator.vibrate(8);
      break;
    case "pet":
      navigator.vibrate([20, 18, 28]);
      break;
  }
}

export function triggerGameFeedback(kind: FeedbackKind, prefs: GameFeedbackPrefs) {
  if (prefs.sound) playSound(kind);
  if (prefs.haptics) playHaptic(kind);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mochi-fx", { detail: { kind } }));
  }
}
