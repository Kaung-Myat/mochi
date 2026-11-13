export const PWA_INSTALL_STORAGE_KEY = "mochi.pwaInstall.v1";

export type PwaInstallPrefs = {
  dismissedAt: number | null;
  neverAsk: boolean;
};

export const defaultPwaInstallPrefs: PwaInstallPrefs = {
  dismissedAt: null,
  neverAsk: false,
};

const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

export function readPwaInstallPrefs(): PwaInstallPrefs {
  if (typeof window === "undefined") return defaultPwaInstallPrefs;
  try {
    const raw = window.localStorage.getItem(PWA_INSTALL_STORAGE_KEY);
    if (!raw) return defaultPwaInstallPrefs;
    const parsed = JSON.parse(raw) as Partial<PwaInstallPrefs>;
    return {
      dismissedAt: typeof parsed.dismissedAt === "number" ? parsed.dismissedAt : null,
      neverAsk: Boolean(parsed.neverAsk),
    };
  } catch {
    return defaultPwaInstallPrefs;
  }
}

export function writePwaInstallPrefs(prefs: PwaInstallPrefs) {
  window.localStorage.setItem(PWA_INSTALL_STORAGE_KEY, JSON.stringify(prefs));
}

export function shouldOfferPwaInstall(prefs: PwaInstallPrefs = readPwaInstallPrefs()) {
  if (prefs.neverAsk) return false;
  if (prefs.dismissedAt && Date.now() - prefs.dismissedAt < DISMISS_COOLDOWN_MS) return false;
  return true;
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
