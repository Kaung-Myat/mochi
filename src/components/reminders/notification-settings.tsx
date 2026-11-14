"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
import { useGameFeedback } from "@/components/game/game-feedback-provider";
import {
  disableNotifications,
  enableNotifications,
  getNotificationCapability,
  hasLocalNotificationDevice,
  saveReminderPreferences,
  sendTestReminder,
  subscribeForegroundReminders,
  subscribeReminderPreferences,
  type NotificationCapability,
} from "@/lib/reminders/repository";
import { defaultReminderPreferences, type ReminderPreferences } from "@/lib/reminders/schema";

const capabilityLabels: Record<NotificationCapability, string> = {
  checking: "စစ်ဆေးနေတယ်…",
  unsupported: "ဒီ browser မှာ အသုံးပြုလို့မရသေးပါဘူး",
  default: "ခွင့်ပြုချက် မရွေးရသေးပါဘူး",
  denied: "Browser က ပိတ်ထားပါတယ်",
  granted: "Browser က ခွင့်ပြုထားပါတယ်",
};

export function NotificationSettings() {
  const { user } = useAuthState();
  const { play } = useGameFeedback();
  const [capability, setCapability] = useState<NotificationCapability>("checking");
  const [registered, setRegistered] = useState(false);
  const [iosInstallRequired, setIosInstallRequired] = useState(false);
  const [androidHint, setAndroidHint] = useState(false);
  const [preferences, setPreferences] = useState<ReminderPreferences>(defaultReminderPreferences);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"enable" | "disable" | "save" | "test" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"device" | "schedule">("device");

  useEffect(() => {
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const android = /Android/i.test(navigator.userAgent);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setAndroidHint(android);
    void getNotificationCapability().then((value) => {
      setIosInstallRequired(ios && !standalone);
      setCapability(value);
      setRegistered(value === "granted" && hasLocalNotificationDevice());
    });
  }, []);

  useEffect(() => {
    if (capability !== "granted") return;
    return subscribeForegroundReminders(() => {
      setMessage("Mochi ရဲ့ သတိပေးချက် ရောက်လာပါပြီ။");
      play("soft");
    });
  }, [capability, play]);

  useEffect(() => {
    if (!user) return;
    return subscribeReminderPreferences(
      user.uid,
      (value) => {
        setPreferences(value);
        setLoading(false);
      },
      () => {
        setError("သတိပေးချက်ဆက်တင်တွေကို မဖွင့်နိုင်သေးပါဘူး။ အင်တာနက်စစ်ပြီး ထပ်စမ်းပေးနော်။");
        setLoading(false);
      },
    );
  }, [user]);

  async function perform(
    action: NonNullable<typeof busy>,
    callback: () => Promise<void>,
    success: string,
  ) {
    setBusy(action);
    setError(null);
    setMessage(null);
    try {
      await callback();
      play(action === "disable" ? "soft" : "success");
      setMessage(success);
      const nextCapability = await getNotificationCapability();
      setCapability(nextCapability);
      setRegistered(nextCapability === "granted" && hasLocalNotificationDevice());
    } catch (caught) {
      console.error("Notification settings action failed", action, caught);
      setError(notificationErrorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  if (!user || loading) {
    return (
      <p className="mt-6 text-center text-sm text-stone-600" role="status">
        သတိပေးချက်ဆက်တင်တွေကို ဖွင့်နေတယ်…
      </p>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      <div className="grid grid-cols-2 gap-2 rounded-[1.35rem] border-[3px] border-white bg-white/80 p-1.5 shadow-[0_5px_0_#f0c9a8]">
        <TabButton active={activePanel === "device"} onClick={() => setActivePanel("device")}>
          ဒီစက်
        </TabButton>
        <TabButton active={activePanel === "schedule"} onClick={() => setActivePanel("schedule")}>
          အချိန်များ
        </TabButton>
      </div>

      {activePanel === "device" && (
        <>
          <section className="rounded-[1.5rem] border-[3px] border-white bg-[#fff7ee] p-4 shadow-[0_5px_0_#f0c9a8]">
            <p className="text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">DEVICE LINK</p>
            <h2 className="mt-0.5 text-lg font-semibold text-[#3a2a24]">
              မင်းရွေးချယ်မှသာ Mochi က ခွင့်တောင်းမယ်
            </h2>
            <p className="mt-2 text-[0.78rem] text-stone-600">
              Lock screen ပေါ်မှာ ကိုယ်ရေးကိုယ်တာ မဖော်ပြပါဘူး။ Web notification တွေဟာ browser / အင်တာနက် /
              ဖုန်း power setting ပေါ်မူတည်ပါတယ်။
            </p>
          </section>

          {iosInstallRequired && (
            <section className="rounded-[1.5rem] border-2 border-amber-300 bg-amber-50 p-4" role="status">
              <h2 className="text-base font-semibold text-[#3a2a24]">
                iPhone မှာ Home Screen ထဲ အရင်ထည့်ပေးနော်
              </h2>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[0.78rem] text-stone-700">
                <li>Safari အောက်ဘက်က Share ခလုတ်ကို နှိပ်ပါ။</li>
                <li>“Add to Home Screen” ကိုရွေးပြီး Add နှိပ်ပါ။</li>
                <li>Home Screen က Mochi icon ကနေ ပြန်ဖွင့်ပါ။</li>
              </ol>
            </section>
          )}

          {androidHint && capability === "unsupported" && (
            <section className="rounded-[1.5rem] border-2 border-amber-300 bg-amber-50 p-4" role="status">
              <h2 className="text-base font-semibold text-[#3a2a24]">Chrome နဲ့ ဖွင့်ပေးနော်</h2>
              <p className="mt-2 text-[0.78rem] text-stone-700">
                Facebook / Messenger ထဲက browser မှာ Push မရတတ်ပါဘူး။ Chrome app သို့မဟုတ် Home Screen
                က Mochi ကို ဖွင့်ပြီး ထပ်စမ်းပေးပါ။
              </p>
            </section>
          )}

          <section className="rounded-[1.5rem] border-[3px] border-white bg-white/90 p-4 shadow-[0_5px_0_#f0c9a8]">
            <p className="text-[0.62rem] font-bold tracking-[0.14em] text-[#1d6f9a]">STATUS</p>
            <h2 className="mt-0.5 text-lg font-semibold text-[#3a2a24]">
              {capabilityLabels[capability]}
            </h2>
            {registered && (
              <p className="mt-1 text-[0.72rem] font-semibold text-emerald-700">ဒီစက် ချိတ်ပြီးပါပြီ</p>
            )}
            {capability === "denied" && (
              <p className="mt-2 text-[0.78rem] text-stone-700">
                Chrome ⋮ → Settings → Site settings → Notifications မှာ Allow ပြောင်းပြီး ဒီစာမျက်နှာကို
                ပြန်ဖွင့်ပေးပါ။
              </p>
            )}
            {capability === "unsupported" && !androidHint && (
              <p className="mt-2 text-[0.78rem] text-stone-700">
                Notification မရရင်လည်း app ထဲက နေ့စဉ်အစီအစဉ်တွေကို ဆက်သုံးလို့ရပါတယ်။
              </p>
            )}
            {androidHint && registered && (
              <p className="mt-2 text-[0.78rem] text-stone-600">
                Android 13+ ဆိုရင် Phone Settings → Apps → Chrome (သို့) Mochi → Notifications ကိုလည်း
                ဖွင့်ထားပေးနော်။
              </p>
            )}

            <div className="mt-4 grid gap-2">
              {!registered &&
                !iosInstallRequired &&
                capability !== "unsupported" &&
                capability !== "denied" && (
                  <button
                    type="button"
                    className="min-h-12 rounded-full bg-[#7a45f5] text-sm font-semibold text-white shadow-[0_4px_0_#4520aa] disabled:opacity-50 active:translate-y-0.5 active:shadow-none"
                    disabled={busy !== null || capability === "checking"}
                    onClick={() =>
                      perform(
                        "enable",
                        () => enableNotifications(user.uid),
                        "ဒီစက်အတွက် သတိပေးချက်ကို ဖွင့်ပြီးပါပြီ။",
                      )
                    }
                  >
                    {busy === "enable" ? "ချိတ်ဆက်နေတယ်…" : "ဒီစက်မှာ သတိပေးချက်ဖွင့်မယ်"}
                  </button>
                )}
              {registered && (
                <>
                  <button
                    type="button"
                    className="min-h-12 rounded-full bg-[#3a2a24] text-sm font-semibold text-white shadow-[0_4px_0_#1f1612] disabled:opacity-50"
                    disabled={busy !== null}
                    onClick={() =>
                      perform(
                        "test",
                        sendTestReminder,
                        "စမ်းသပ်သတိပေးချက်ကို ပို့လိုက်ပါပြီ။ ခဏစောင့်ကြည့်ပေးနော်။",
                      )
                    }
                  >
                    {busy === "test" ? "ပို့နေတယ်…" : "စမ်းသပ်သတိပေးချက် ပို့မယ်"}
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-full border-2 border-[#3a2a24]/15 bg-white text-sm font-semibold text-[#3a2a24] disabled:opacity-50"
                    disabled={busy !== null}
                    onClick={() =>
                      perform(
                        "disable",
                        () => disableNotifications(user.uid),
                        "ဒီစက်ရဲ့ သတိပေးချက်ချိတ်ဆက်မှုကို ပိတ်ပြီးပါပြီ။",
                      )
                    }
                  >
                    {busy === "disable" ? "ပိတ်နေတယ်…" : "ဒီစက်မှာ ပိတ်မယ်"}
                  </button>
                </>
              )}
            </div>
          </section>
        </>
      )}

      {activePanel === "schedule" && (
        <section className="rounded-[1.5rem] border-[3px] border-white bg-white/90 p-4 shadow-[0_5px_0_#f0c9a8]">
          <p className="text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">SCHEDULE</p>
          <h2 className="mt-0.5 text-lg font-semibold text-[#3a2a24]">ဘယ်အချိန်တွေ သတိပေးမလဲ</h2>
          <div className="mt-3 grid gap-2">
            <Toggle
              label="သတိပေးချက်အားလုံး"
              checked={preferences.enabled}
              onChange={(enabled) => setPreferences({ ...preferences, enabled })}
            />
            <Toggle
              label="ရေသောက်ချိန်"
              checked={preferences.hydrationEnabled}
              onChange={(hydrationEnabled) => setPreferences({ ...preferences, hydrationEnabled })}
            />
            <Toggle
              label="စားချိန်"
              checked={preferences.mealsEnabled}
              onChange={(mealsEnabled) => setPreferences({ ...preferences, mealsEnabled })}
            />
            <Toggle
              label="အိပ်ချိန်"
              checked={preferences.sleepEnabled}
              onChange={(sleepEnabled) => setPreferences({ ...preferences, sleepEnabled })}
            />
            <Toggle
              label="မနှောင့်ယှက်ရမယ့်အချိန်ထားမယ်"
              checked={preferences.quietHoursEnabled}
              onChange={(quietHoursEnabled) =>
                setPreferences({ ...preferences, quietHoursEnabled })
              }
            />
            {preferences.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-2.5">
                <TimeField
                  label="စမယ့်အချိန်"
                  value={preferences.quietStartLocalTime}
                  onChange={(quietStartLocalTime) =>
                    setPreferences({ ...preferences, quietStartLocalTime })
                  }
                />
                <TimeField
                  label="ပြီးမယ့်အချိန်"
                  value={preferences.quietEndLocalTime}
                  onChange={(quietEndLocalTime) =>
                    setPreferences({ ...preferences, quietEndLocalTime })
                  }
                />
              </div>
            )}
          </div>
          <button
            type="button"
            className="mt-4 min-h-12 w-full rounded-full bg-[#3a2a24] text-sm font-semibold text-white shadow-[0_4px_0_#1f1612] disabled:opacity-50"
            disabled={busy !== null}
            onClick={() =>
              perform(
                "save",
                () => saveReminderPreferences(user.uid, preferences),
                "သတိပေးချက်အချိန်တွေကို သိမ်းပြီးပါပြီ။",
              )
            }
          >
            {busy === "save" ? "သိမ်းနေတယ်…" : "ပြောင်းလဲမှုတွေ သိမ်းမယ်"}
          </button>
        </section>
      )}

      {message && (
        <p className="rounded-2xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-2xl bg-red-50 px-3 py-2.5 text-sm text-red-900" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-2xl px-3 text-sm font-semibold transition ${
        active
          ? "bg-[#ffd15c] text-[#3a2a24] shadow-[0_2px_0_#e2b000]"
          : "text-[#6b5548]"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border-2 px-3 text-left text-sm font-semibold ${
        checked
          ? "border-[#3a2a24] bg-[#ffd15c] text-[#3a2a24]"
          : "border-[#f0d2bc] bg-[#fffaf3] text-[#6b5548]"
      }`}
    >
      <span>{label}</span>
      <span className="text-[0.72rem]">{checked ? "ON" : "OFF"}</span>
    </button>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-[0.78rem] font-semibold text-[#3a2a24]">
      {label}
      <input
        className="min-h-11 rounded-2xl border-2 border-[#f0d2bc] bg-white px-3 text-sm"
        type="time"
        value={value}
        required
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

function notificationErrorMessage(error: unknown): string {
  const value = error instanceof Error ? error.message : "";
  const code = value.replace(/^notifications\//, "");

  if (code === "denied" || value === "notifications/denied") {
    return "Notification ကို browser က ပိတ်ထားပါတယ်။ Site settings ထဲမှာ Allow ပြောင်းပေးပါ။";
  }
  if (code === "unsupported") {
    return "ဒီ browser သို့မဟုတ် device မှာ Web Push ကို အသုံးပြုလို့မရသေးပါဘူး။ Chrome နဲ့ ထပ်စမ်းပေးနော်။";
  }
  if (code === "missing-vapid-key") {
    return "VAPID key မတွေ့ပါဘူး။ .env.local ကိုစစ်ပြီး dev server ပြန်ဖွင့်ပေးပါ။";
  }
  if (code === "sw-timeout" || code === "sw-failed" || code === "sw-missing") {
    return "Service worker မတက်နိုင်သေးဘူး။ အင်တာနက်စစ်ပြီး Chrome ကို ပြန်ဖွင့်ကာ ထပ်စမ်းပေးနော်။";
  }
  if (code === "push-unavailable") {
    return "ဒီစက်မှာ Push service မရသေးပါဘူး။ Chrome app notifications ဖွင့်ထားကြောင်း စစ်ပေးပါ။";
  }
  if (code === "token-unavailable") {
    return "FCM token မရသေးဘူး။ Permission ခွင့်ပြုပြီးမှ ထပ်စမ်းပေးနော်။";
  }
  if (code === "offline") {
    return "အင်တာနက် / VPN ကြောင့် ချိတ်ဆက်မရသေးဘူး။ VPN ပိတ်ပြီး Wi‑Fi ကောင်းကောင်းနဲ့ ထပ်စမ်းပေးနော်။";
  }
  if (code === "firestore-permission" || code === "prefs-save-failed" || code === "device-save-failed") {
    return "သတိပေးချက်ဆက်တင်ကို မသိမ်းနိုင်သေးဘူး။ ထပ်လော့ဂ်အင်ဝင်ပြီး ထပ်စမ်းပေးနော်။";
  }
  if (code === "no-active-device") {
    return "ဒီစက် token မတွေ့သေးဘူး။ အရင် “ဒီစက်မှာ သတိပေးချက်ဖွင့်မယ်” ကို ပြန်နှိပ်ပေးနော်။";
  }
  if (code === "delivery-unavailable") {
    return "သတိပေးချက် ပို့မရသေးဘူး။ Chrome notifications ဖွင့်ထားကြောင်း စစ်ပြီး ထပ်စမ်းပေးနော်။";
  }
  if (code === "unauthenticated" || code === "401") {
    return "အကောင့် session ကုန်သွားပြီ။ ထပ်လော့ဂ်အင်ဝင်ပြီး ထပ်စမ်းပေးနော်။";
  }
  if (code === "rate-limited" || code === "429") {
    return "ခဏအရမ်းများနှိပ်မိသွားတယ်။ စက္ကန့်အနည်းငယ်စောင့်ပြီး ထပ်စမ်းပေးနော်။";
  }
  if (code === "admin-not-configured") {
    return "Firebase Admin credentials မထည့်ရသေးဘူး။ .env.local ထဲ FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY ထည့်ပြီး server ပြန်ဖွင့်ပေးနော်။";
  }
  if (code === "not-found" || code === "internal" || code === "500" || code === "503") {
    return "သတိပေးချက် backend မရသေးဘူး။ server env (Firebase Admin) ကို စစ်ပြီး ထပ်စမ်းပေးနော်။";
  }
  return "သတိပေးချက်ကို မပြင်ဆင်နိုင်သေးဘူး။ အင်တာနက်စစ်ပြီး ထပ်စမ်းပေးနော်။";
}
