import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase/client";
import {
  defaultReminderPreferences,
  deviceRegistrationSchema,
  reminderPreferencesSchema,
  type ReminderPreferences,
} from "./schema";

const deviceStorageKey = "mochi.notification-device-id";

export type NotificationCapability = "checking" | "unsupported" | "default" | "denied" | "granted";

export function hasLocalNotificationDevice(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage.getItem(deviceStorageKey));
}

export async function getNotificationCapability(): Promise<NotificationCapability> {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator)
  ) {
    return "unsupported";
  }

  const { isSupported } = await import("firebase/messaging");
  if (!(await isSupported())) return "unsupported";
  return Notification.permission;
}

function getOrCreateDeviceId(): string {
  const existing = window.localStorage.getItem(deviceStorageKey);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(deviceStorageKey, next);
  return next;
}

function summarizeUserAgent(): string | undefined {
  const value = navigator.userAgent.replace(/\s+/g, " ").trim();
  return value ? value.slice(0, 160) : undefined;
}

export async function enableNotifications(uid: string): Promise<void> {
  const capability = await getNotificationCapability();
  if (capability === "unsupported") throw new Error("notifications/unsupported");

  const permission =
    Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") throw new Error(`notifications/${permission}`);

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();
  if (!vapidKey) throw new Error("notifications/missing-vapid-key");

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/",
  });
  await navigator.serviceWorker.ready;

  const { getMessaging, getToken } = await import("firebase/messaging");
  const { app, db } = getFirebaseClient();
  const fcmToken = await getToken(getMessaging(app), {
    vapidKey,
    serviceWorkerRegistration: registration,
  });
  if (!fcmToken) throw new Error("notifications/token-unavailable");

  const id = getOrCreateDeviceId();
  const reference = doc(db, "users", uid, "devices", id);
  const existing = await getDoc(reference);
  const value = deviceRegistrationSchema.parse({
    id,
    fcmToken,
    platform: "web",
    permission: "granted",
    userAgentSummary: summarizeUserAgent(),
    enabled: true,
  });
  const device = {
    fcmToken: value.fcmToken,
    platform: value.platform,
    permission: value.permission,
    ...(value.userAgentSummary ? { userAgentSummary: value.userAgentSummary } : {}),
    enabled: value.enabled,
  };

  await setDoc(
    reference,
    {
      ...device,
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    },
    { merge: true },
  );

  try {
    await refreshReminderSchedule();
  } catch {
    // Registration remains useful if the scheduled backend has not been deployed yet.
  }
}

export async function disableNotifications(uid: string): Promise<void> {
  const { app, db } = getFirebaseClient();
  const deviceId = window.localStorage.getItem(deviceStorageKey);

  if (deviceId) {
    await deleteDoc(doc(db, "users", uid, "devices", deviceId));
    window.localStorage.removeItem(deviceStorageKey);
  }

  const { getMessaging, deleteToken, isSupported } = await import("firebase/messaging");
  if (await isSupported()) await deleteToken(getMessaging(app));
  await authenticatedPost("/api/reminders/deactivate").catch(() => undefined);
}

export function subscribeReminderPreferences(
  uid: string,
  onValue: (preferences: ReminderPreferences) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const { db } = getFirebaseClient();
  return onSnapshot(
    doc(db, "users", uid, "reminderSettings", "preferences"),
    (snapshot) => {
      if (!snapshot.exists()) {
        onValue(defaultReminderPreferences);
        return;
      }
      const parsed = reminderPreferencesSchema.safeParse(snapshot.data());
      onValue(parsed.success ? parsed.data : defaultReminderPreferences);
    },
    onError,
  );
}

export async function saveReminderPreferences(
  uid: string,
  preferences: ReminderPreferences,
): Promise<void> {
  const value = reminderPreferencesSchema.parse(preferences);
  const { db } = getFirebaseClient();
  const reference = doc(db, "users", uid, "reminderSettings", "preferences");
  const existing = await getDoc(reference);
  await setDoc(
    reference,
    {
      ...value,
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function sendTestReminder(): Promise<void> {
  await authenticatedPost("/api/reminders/test");
}

export async function refreshReminderSchedule(): Promise<void> {
  await authenticatedPost("/api/reminders/refresh");
}

export function subscribeForegroundReminders(onReminder: () => void): () => void {
  let unsubscribe: (() => void) | undefined;
  void import("firebase/messaging").then(({ getMessaging, onMessage }) => {
    const { app } = getFirebaseClient();
    unsubscribe = onMessage(getMessaging(app), () => onReminder());
  });
  return () => unsubscribe?.();
}

async function authenticatedPost(path: string): Promise<void> {
  const { auth } = getFirebaseClient();
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("notifications/unauthenticated");
  const response = await fetch(path, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(`notifications/${body?.error ?? response.status}`);
  }
}
