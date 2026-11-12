"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "@/components/auth/auth-provider";
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
  const [capability, setCapability] = useState<NotificationCapability>("checking");
  const [registered, setRegistered] = useState(false);
  const [iosInstallRequired, setIosInstallRequired] = useState(false);
  const [preferences, setPreferences] = useState<ReminderPreferences>(defaultReminderPreferences);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"enable" | "disable" | "save" | "test" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"device" | "schedule">("device");

  useEffect(() => {
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
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
    });
  }, [capability]);

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
      setMessage(success);
      const nextCapability = await getNotificationCapability();
      setCapability(nextCapability);
      setRegistered(nextCapability === "granted" && hasLocalNotificationDevice());
    } catch (caught) {
      setError(notificationErrorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  if (!user || loading) {
    return (
      <p className="mt-8 text-stone-600" role="status">
        သတိပေးချက်ဆက်တင်တွေကို ဖွင့်နေတယ်…
      </p>
    );
  }

  return (
    <div className="mt-8 grid gap-6">
      <div className="grid grid-cols-2 gap-2 rounded-[1.6rem] border border-white/80 bg-white/60 p-2 shadow-[0_12px_30px_rgba(80,45,40,0.08)]">
        <button
          type="button"
          aria-pressed={activePanel === "device"}
          onClick={() => setActivePanel("device")}
          className={`min-h-11 rounded-2xl px-3 text-sm font-semibold ${activePanel === "device" ? "bg-rose-500 text-white" : "text-stone-600"}`}
        >
          ဒီစက်
        </button>
        <button
          type="button"
          aria-pressed={activePanel === "schedule"}
          onClick={() => setActivePanel("schedule")}
          className={`min-h-11 rounded-2xl px-3 text-sm font-semibold ${activePanel === "schedule" ? "bg-rose-500 text-white" : "text-stone-600"}`}
        >
          အချိန်များ
        </button>
      </div>

      {activePanel === "device" && (
        <>
          <section className="rounded-3xl bg-[#f4dfd4] p-6">
            <p className="text-sm text-stone-600">နူးညံ့တဲ့ သတိပေးချက်</p>
            <h2 className="mt-1 text-2xl font-semibold">မင်းရွေးချယ်မှသာ Mochi က ခွင့်တောင်းမယ်</h2>
            <p className="mt-3 text-stone-700">
              Lock screen ပေါ်မှာ ကိုယ်ရေးကိုယ်တာ၊ စားသောက်မှုနဲ့ ဝမ်းဗိုက်မှတ်စုတွေ မဖော်ပြပါဘူး။
              Web notification တွေဟာ browser၊ အင်တာနက်နဲ့ ဖုန်းရဲ့ power setting ပေါ်မူတည်လို့
              အချိန်အတိအကျရောက်မယ်လို့ အာမခံလို့မရပါဘူး။
            </p>
          </section>

          {iosInstallRequired && (
            <section className="rounded-3xl border border-amber-300 bg-amber-50 p-5" role="status">
              <h2 className="text-xl font-semibold">iPhone မှာ Home Screen ထဲ အရင်ထည့်ပေးနော်</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-stone-700">
                <li>Safari အောက်ဘက်က Share ခလုတ်ကို နှိပ်ပါ။</li>
                <li>“Add to Home Screen” ကိုရွေးပြီး Add နှိပ်ပါ။</li>
                <li>Safari tab ကိုပိတ်ပြီး Home Screen က Mochi icon ကနေ ပြန်ဖွင့်ပါ။</li>
              </ol>
              <p className="mt-3 text-sm text-stone-700">
                iPhone မှာ Home Screen app အဖြစ်ဖွင့်ထားမှ Web Push permission တောင်းလို့ရပါတယ်။
              </p>
            </section>
          )}

          <section className="rounded-3xl border border-stone-200 bg-white/70 p-5">
            <p className="text-sm text-stone-500">လက်ရှိအခြေအနေ</p>
            <h2 className="mt-1 text-xl font-semibold">{capabilityLabels[capability]}</h2>
            {capability === "denied" && (
              <p className="mt-3 text-sm text-stone-700">
                Address bar ဘေးက site settings ထဲဝင်ပြီး Notifications ကို Allow ပြောင်းပြီး
                ဒီစာမျက်နှာကို ပြန်ဖွင့်ပေးပါ။ Mochi က ထပ်ခါထပ်ခါ permission မတောင်းပါဘူး။
              </p>
            )}
            {capability === "unsupported" && (
              <p className="mt-3 text-sm text-stone-700">
                Notification မရရင်လည်း app ထဲက နောက်သတိပေးချက်နဲ့ နေ့စဉ်အစီအစဉ်တွေကို
                ဆက်သုံးလို့ရပါတယ်။
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {!registered &&
                !iosInstallRequired &&
                capability !== "unsupported" &&
                capability !== "denied" && (
                  <button
                    type="button"
                    className="min-h-11 rounded-full bg-stone-900 px-5 text-white disabled:opacity-50"
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
                    className="min-h-11 rounded-full bg-stone-900 px-5 text-white disabled:opacity-50"
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
                    className="min-h-11 rounded-full border border-stone-400 px-5 disabled:opacity-50"
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
            {registered && (
              <div className="mt-3 text-sm text-stone-600">
                <p>
                  Lock-screen notification ကိုစမ်းကြည့်ဖို့ ခလုတ်နှိပ်ပြီး app ကို background
                  မှာထားပေးနော်။
                </p>
                <p className="mt-2">
                  iPhone Settings → Notifications → Mochi ထဲမှာ Banners, Lock Screen နဲ့ Sounds ကို
                  ဖွင့်ထားပြီး Focus mode က Mochi ကိုမပိတ်ထားကြောင်းလည်း စစ်ပေးပါ။
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {activePanel === "schedule" && (
        <section className="rounded-3xl border border-stone-200 bg-white/70 p-5">
          <h2 className="text-2xl font-semibold">ဘယ်အချိန်တွေ သတိပေးမလဲ</h2>
          <div className="mt-5 grid gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
            className="mt-5 min-h-11 rounded-full bg-stone-900 px-5 text-white disabled:opacity-50"
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
        <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-900" role="alert">
          {error}
        </p>
      )}
    </div>
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
    <label className="flex min-h-11 items-center justify-between gap-4">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
    </label>
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
    <label className="grid gap-2 text-sm">
      {label}
      <input
        className="min-h-11 rounded-xl border border-stone-300 bg-white px-3"
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
  if (value.includes("denied")) {
    return "Notification ကို browser က ပိတ်ထားပါတယ်။ Site settings ထဲမှာ Allow ပြောင်းပေးပါ။";
  }
  if (value.includes("unsupported")) {
    return "ဒီ browser သို့မဟုတ် device မှာ Web Push ကို အသုံးပြုလို့မရသေးပါဘူး။";
  }
  if (value.includes("missing-vapid-key")) {
    return "VAPID key မတွေ့ပါဘူး။ .env.local ကိုစစ်ပြီး dev server ပြန်ဖွင့်ပေးပါ။";
  }
  if (value.includes("not-found") || value.includes("internal")) {
    return "စမ်းသပ်သတိပေးချက်ပို့မယ့် backend ကို မတင်ရသေးပါဘူး။";
  }
  return "သတိပေးချက်ကို မပြင်ဆင်နိုင်သေးပါဘူး။ အင်တာနက်စစ်ပြီး ထပ်စမ်းပေးနော်။";
}
