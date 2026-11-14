import { getFirebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";

export const dynamic = "force-dynamic";

export function GET() {
  if (!isFirebaseConfigured) {
    return new Response("Firebase is not configured for messaging.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const config = JSON.stringify(getFirebaseConfig()).replaceAll("<", "\\u003c");
  const source = `
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const requestedPath = event.notification.data?.link || "/today";
  const target = new URL(requestedPath, self.location.origin);
  if (target.origin !== self.location.origin) return;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => new URL(client.url).origin === target.origin);
      if (existing) {
        existing.navigate(target.href);
        return existing.focus();
      }
      return clients.openWindow(target.href);
    }),
  );
});

importScripts("https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js");
firebase.initializeApp(${config});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const link = typeof payload.data?.link === "string" ? payload.data.link : "/today";
  self.registration.showNotification("Mochi က မင်းကို သတိရနေတယ် 🤎", {
    body: "နူးညံ့တဲ့ သတိပေးချက်လေးတစ်ခု ရှိတယ်နော်။",
    tag: typeof payload.data?.occurrenceId === "string" ? payload.data.occurrenceId : "mochi-reminder",
    renotify: true,
    silent: false,
    icon: "/icons/mochi-192.png",
    badge: "/icons/mochi-192.png",
    data: { link },
  });
});
`;

  return new Response(source, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": "/",
    },
  });
}
