# Mochi — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Status:** MVP build-ready  
> **Product type:** Mobile-first Progressive Web App (PWA)  
> **Primary audience:** A private, caring gift for one special person  
> **Working language:** Burmese-friendly UI copy with English technical terminology  
> **Suggested coding workflow:** ChatGPT 5.6 Soul or Terra may be used as the coding assistant. This PRD does not assume or claim any unverified model capability.

---

## 1. Product Summary

**Mochi** is a gentle, cozy health-routine companion built as a personal gift for the creator’s crush. A soft 3D red panda named **Mochi** helps the user remember water, meals, sleep, and simple tummy-symptom check-ins. The experience should feel like someone quietly cares—not like a clinical dashboard, productivity tracker, or nagging alarm app.

**Brand line:** *a little friend who cares for you.*  
**Emotional reveal:** *Someone made me just for you. ♡*

Mochi supports wellbeing habits and personal record-keeping only. It **must not diagnose, predict, or treat illness**, recommend medication, or imply that logged data replaces professional medical advice.

---

## 2. Product Vision

### 2.1 Vision statement

Create a small, emotionally warm mobile experience that makes everyday self-care easier through a lovable companion, kind reminders, and low-effort tracking.

### 2.2 Gift intent

The MVP is designed first as a **private gift for one person**, while the architecture should avoid hard-coding a single account so the project can later become a multi-user public PWA if desired.

The romantic intent should remain subtle:

- Caring, not possessive.
- Personal, not intrusive.
- Warm, not overly romantic.
- Supportive, not guilt-inducing.
- The recipient controls reminders, privacy, data, and notification permissions.

### 2.3 Product principles

1. **Gentle by default** — Never shame the user for missing a habit.
2. **One-thumb simple** — Common actions should take one or two taps.
3. **Companion first** — Mochi’s expressions and language carry the experience.
4. **Privacy is part of care** — Collect the minimum data and explain why.
5. **No medical overreach** — Track symptoms without interpreting or diagnosing them.
6. **Useful without perfection** — Partial logging is valid; streaks must not become pressure.
7. **Graceful degradation** — Core tracking works even if 3D, push, or install features are unavailable.

---

## 3. Goals and Non-goals

### 3.1 MVP goals

- Deliver a polished mobile-first PWA that can be installed where supported.
- Provide a memorable onboarding moment featuring Mochi.
- Let the user configure hydration, meal, and sleep schedules.
- Make completion logging fast and reassuring.
- Allow simple tummy-symptom journaling without medical conclusions.
- Send personalized, gentle reminders through supported web push.
- Sync authenticated user data across devices with Firebase.
- Provide strong privacy controls, including notification controls and account/data deletion.
- Keep the 3D mascot performant, optional, and accessible.

### 3.2 Non-goals for MVP

- Medical diagnosis, symptom triage engine, treatment plans, or medication advice.
- Emergency monitoring or guaranteed delivery of urgent alerts.
- Integration with Apple Health, Health Connect, wearables, or clinical systems.
- Calorie counting, nutrition analysis, weight tracking, or eating-goal optimization.
- Public social feed, competitive leaderboards, or sharing private health logs.
- AI chatbot giving health advice.
- Native iOS/Android applications.
- Complex analytics dashboards or long-term clinical reports.
- Multiple mascot species or a marketplace.
- Offline creation of server-scheduled reminders; network access is required to sync schedules.

---

## 4. Target User and Core Jobs

### 4.1 Primary user

A mobile user who appreciates cute, cozy experiences and benefits from low-pressure prompts for regular meals, hydration, sleep, and personal symptom notes.

### 4.2 Jobs to be done

- “When I get busy, remind me gently to drink water or eat.”
- “Help me keep a regular bedtime and wake time without making me feel judged.”
- “Let me quickly note how my tummy feels so I can remember patterns later.”
- “Show me today’s essentials in one calm place.”
- “Make self-care feel warm and personal.”

---

## 5. Brand and Character Direction

### 5.1 Mochi character

- **Species:** Baby red panda.
- **Style:** Premium cozy 3D, rounded shapes, fluffy but optimized materials, warm soft lighting.
- **Personality:** Gentle, caring, slightly shy, affectionate, never demanding.
- **Voice:** Short, warm, reassuring; occasional simple emoji; avoids baby-talk overload.
- **Behavior:** Wakes, waves, stretches, drinks, eats, sleeps, celebrates softly, and looks concerned without creating alarm.

### 5.2 Visual direction

- Warm cream, peach, cocoa, dusty rose, and soft sage palette.
- Rounded cards, comfortable spacing, soft shadows, subtle gradients.
- Avoid hospital-blue visual language and dense clinical charts.
- Use motion sparingly and respect reduced-motion settings.
- UI must remain readable and functional before the 3D scene loads.

### 5.3 Example copy

| Context | Burmese-friendly copy |
|---|---|
| Welcome | “ဟေး… ငါက Mochi ပါ 🐾” |
| Purpose | “မင်းကို နေ့တိုင်း နည်းနည်းလေး ဂရုစိုက်ပေးဖို့ ရောက်လာတာပါ။” |
| Water | “ရေလေး နည်းနည်းသောက်ရအောင်နော် 💧” |
| Meal | “အလုပ်ရှုပ်နေလည်း အစာစားဖို့ မမေ့နဲ့နော် 🍚” |
| Sleep | “ဒီနေ့အတွက် တော်တော်ကြိုးစားခဲ့ပြီ။ နားရအောင်နော် 🌙” |
| Missed item | “မဖြစ်ပါဘူး—အဆင်ပြေတဲ့အချိန်မှ ပြန်စကြမယ်နော်။” |
| Completion | “ကောင်းတယ်နော်။ Mochi ဝမ်းသာတယ် 🤎” |

Copy guidelines:

- Keep notification titles short enough to scan on a lock screen.
- Never use guilt, fear, scolding, or relationship pressure.
- Do not say “healthy/unhealthy” based on a single action.
- Never infer illness from tummy logs.

---

## 6. Information Architecture

### 6.1 Primary navigation

Use a bottom navigation bar with four destinations:

1. **Today** — Mochi, current greeting, next reminder, today’s routine cards, quick actions.
2. **Tummy** — Symptom check-in, recent entries, simple history filters.
3. **Routine** — Hydration, meals, sleep schedules, reminder settings.
4. **Settings** — Profile, notifications, language, accessibility, privacy, export/delete.

### 6.2 Key routes

```text
/
/welcome
/onboarding
/today
/tummy
/tummy/new
/routine
/settings
/settings/notifications
/settings/privacy
/auth/sign-in
/auth/action
/offline
```

Authenticated routes redirect unauthenticated users to sign-in. Completed onboarding redirects away from onboarding unless the user explicitly opens it again.

---

## 7. Functional Requirements

### 7.1 First launch and onboarding

#### Flow

1. Branded splash shell appears immediately; do not block on the GLB asset.
2. Mochi wakes and waves if 3D and motion are available.
3. Show three short intro messages:
   - “ဟေး… ငါက Mochi ပါ 🐾”
   - “ရေသောက်ဖို့၊ အစာစားဖို့နဲ့ အိပ်ချိန်မှန်ဖို့ သတိပေးပေးမယ်နော်။”
   - “Someone made me just for you. ♡”
4. Explain what data is stored and that tummy tracking is not medical advice.
5. Ask for display name or nickname; allow skip with a neutral fallback.
6. Detect timezone and ask the user to confirm it.
7. Configure an initial schedule:
   - Wake time and bedtime.
   - Meal names/times; default breakfast, lunch, dinner but fully editable.
   - Hydration reminder window and interval or selected times.
8. Explain notifications, then request permission only after a user tap.
9. Offer install instructions only when relevant to the current browser/platform.
10. Finish on Today with a calm celebration.

#### Requirements

- Progress is saved after each completed step.
- Notification denial must not block onboarding or core use.
- User can change all values later.
- Timezone uses an IANA identifier such as `Asia/Yangon`, not a fixed UTC offset.
- Do not automatically trigger browser notification permission on page load.

### 7.2 Authentication

MVP supports:

- Firebase Authentication with Google sign-in where supported.
- Email link or email/password sign-in as a reliable fallback; choose one during implementation and document it.
- Sign out.
- Clear authentication error states without leaking internal details.
- Account deletion with recent-authentication handling.

The UI should explain that signing in protects and synchronizes private data. Anonymous auth may be added later, but it is not required for MVP because account merging and recovery increase complexity.

### 7.3 Today dashboard

The Today screen contains:

- Local-time greeting using the saved nickname.
- Mochi scene or lightweight fallback illustration.
- “Next up” card showing the next enabled reminder.
- Hydration progress for the day.
- Meal cards with scheduled, completed, skipped, or pending state.
- Sleep card for bedtime/wake plan and optional sleep log.
- Quick tummy check-in.
- Supportive daily message.

Actions must update optimistically, prevent accidental duplicate records, and clearly recover from sync errors.

### 7.4 Hydration

The user can:

- Set a daily target in number of glasses, with an optional milliliter value per glass.
- Choose a reminder window, interval, or specific reminder times.
- Tap once to log one glass.
- Undo the most recent hydration entry for the current day.
- Disable reminders without deleting history.

MVP does not claim a medically appropriate water target. Any defaults are interface examples and must be editable. Avoid suggesting that one universal quantity is correct.

### 7.5 Meals

The user can:

- Create, rename, reorder, enable, or disable meal schedules.
- Set a local reminder time for each meal.
- Mark a meal as eaten, skipped, or leave it pending.
- Add an optional short note; no calorie or nutrition calculation.
- Correct today’s status.

Use neutral language for skipped meals. Do not reward restriction or imply moral value.

### 7.6 Sleep schedules

The user can:

- Set usual bedtime and wake time.
- Configure bedtime wind-down and wake reminders.
- Support schedules crossing midnight.
- Optionally record “went to bed” and “woke up” timestamps.
- View recent sleep times and approximate duration when both timestamps exist.
- Override selected days later; MVP may use one weekly schedule with enabled weekdays.

The app must not claim to measure sleep quality or actual sleep without validated sensor data. Labels should say “sleep time you logged” rather than “detected sleep.”

### 7.7 Tummy symptom tracking

#### Entry fields

- `occurredAt` date and local time.
- Overall discomfort intensity: 0–10, described as a personal scale rather than a diagnosis.
- Symptom tags: pain/cramp, bloating, nausea, heartburn, diarrhea, constipation, gas, other.
- Optional location: upper, lower, left, right, all-over, unsure.
- Optional duration in minutes.
- Optional short note.
- Optional relation to a meal: before, after, unsure, not specified.
- Optional mood/energy tag, clearly presented as context only.

#### Behavior and safety

- Entries are private by default.
- User can create, edit, and delete their own entries.
- History lists newest first and supports a simple date/tag filter.
- The app may summarize factual counts, such as “3 entries this week,” but must not state causes or correlations as medical facts.
- Avoid color coding that falsely implies diagnosis severity. Use accessible neutral-to-warm emphasis.
- Show a persistent note: “Mochi က မှတ်ထားပေးတာပါ။ ရောဂါရှာဖွေခြင်း သို့မဟုတ် ဆေးဘက်ဆိုင်ရာ အကြံပေးခြင်း မဟုတ်ပါ။”
- Provide a general safety message: severe, sudden, persistent, or worrying symptoms should be discussed with a qualified healthcare professional. If the user believes it is an emergency, they should contact local emergency services. Do not attempt location-specific emergency numbers unless maintained and verified.

### 7.8 Reminder personalization

The user can set:

- Reminder enabled/disabled by category.
- Quiet hours.
- Weekdays.
- Gentle copy style, initially one default tone.
- Snooze duration, if the platform and notification-action support permit it.
- Timezone.

Reminder rules:

- Default to a conservative frequency.
- Never include tummy symptom details or other sensitive content on the lock screen.
- Generic push example: “Mochi has a gentle reminder for you 🤎”.
- Deep-link to the relevant screen when opened.
- Do not promise exact-time delivery; web push and background scheduling are best-effort.
- Deduplicate by logical reminder occurrence.
- Recalculate future reminders when schedule or timezone changes.
- Respect quiet hours and user-disabled categories.

### 7.9 Notification lifecycle

1. User sees an in-app explanation.
2. User taps “Enable reminders.”
3. Browser permission is requested.
4. If granted, register the service worker and retrieve an FCM token using the Web Push VAPID configuration.
5. Store the token under the authenticated user with device metadata and last-seen timestamp.
6. Send a test notification only after explicit user action.
7. Refresh/replace invalid tokens and delete them on sign-out where feasible.
8. Cloud Functions delete tokens rejected as invalid/unregistered.

If permission is denied or unavailable, show in-app reminders and platform-specific instructions without repeatedly prompting.

### 7.10 Settings, privacy, and data control

- Edit nickname and timezone.
- Enable/disable all reminder categories.
- View notification permission status.
- Toggle reduced motion in addition to respecting OS preference.
- Choose Burmese-friendly UI or English when localization is implemented; MVP copy can be primarily Burmese with English technical labels avoided in end-user UI.
- Export user data in a readable JSON file.
- Delete individual entries.
- Delete account and associated Firestore data through a server-side deletion flow.
- Display privacy summary, medical disclaimer, app version, and contact/support placeholder.

---

## 8. Mobile-first UX Requirements

- Design from a 360 px-wide viewport upward.
- Support modern mobile browsers and responsive desktop layout.
- Minimum touch target: 44 × 44 CSS px.
- Keep primary actions within comfortable thumb reach.
- Avoid horizontal scrolling at 320 px width.
- Account for `env(safe-area-inset-*)` on notched devices and installed PWAs.
- Use bottom navigation with visible text labels; do not rely on icons alone.
- Forms preserve entered content after validation errors.
- Use native input types where useful but verify date/time behavior across target browsers.
- Loading states should use calm skeletons or a lightweight Mochi placeholder.
- Empty states explain the next action.
- Errors state what happened and what the user can do next.
- Destructive actions require clear confirmation; deletion should not be hidden behind ambiguous icons.

### 8.1 Core screen states

Every major screen must specify and implement:

- Loading.
- Ready with data.
- Empty.
- Offline/cached.
- Recoverable error.
- Permission unavailable/denied where relevant.

---

## 9. Accessibility Requirements

Target practical WCAG 2.2 AA alignment for the MVP.

- Semantic landmarks, headings, labels, buttons, and form controls.
- Keyboard-operable navigation and dialogs.
- Visible focus indicators.
- Text contrast of at least 4.5:1 for normal text and 3:1 for large text/UI components where applicable.
- Never communicate state by color alone.
- Screen-reader names for icons and 3D controls.
- Decorative 3D canvas excluded from the accessibility tree when it carries no unique content.
- Equivalent text status for every mascot expression or animation that conveys information.
- Respect `prefers-reduced-motion`; replace continuous or large movement with a static pose or subtle fade.
- Pause nonessential animation while the tab is hidden and provide a user setting to reduce/disable motion.
- Support text zoom to 200% without loss of content or action.
- Avoid rapid flashes and excessive parallax.
- Error messages are linked to their relevant fields and announced when appropriate.
- Burmese font choice must render Myanmar text correctly and remain legible at small mobile sizes.

---

## 10. Technical Architecture

### 10.1 Required stack

- **Frontend:** Next.js with TypeScript.
- **Styling:** Tailwind CSS.
- **3D:** React Three Fiber with a compressed `.glb` red panda asset.
- **Backend:** Firebase Authentication, Cloud Firestore, Cloud Functions.
- **Scheduling:** Cloud Scheduler invoking a protected Cloud Function.
- **Push:** Firebase Cloud Messaging (FCM) for supported web browsers.
- **Hosting:** Firebase Hosting or another deployment target that supports the chosen Next.js rendering strategy and HTTPS. Decide once during setup and document the deployment path.

Use currently supported stable package versions at implementation time and lock them in the project’s package manager files. Do not invent version numbers in generated code.

### 10.2 Recommended application structure

```text
app/
  (public)/
  (auth)/
  (protected)/
  api/                       # only if required by chosen hosting design
components/
  mochi/
  navigation/
  reminders/
  routines/
  tummy/
  ui/
lib/
  firebase/
  validation/
  dates/
  reminders/
  accessibility/
types/
public/
  models/mochi.glb
  icons/
  firebase-messaging-sw.js   # or generated equivalent compatible with deployment
functions/
  src/
    reminders/
    accountDeletion/
    dataExport/
    index.ts
firestore.rules
firestore.indexes.json
```

This is a recommendation, not a reason to create empty abstractions. Keep business logic testable outside React components.

### 10.3 High-level data flow

```text
Mobile PWA
  ├─ Firebase Auth → authenticated identity
  ├─ Firestore → profile, schedules, logs, device tokens
  ├─ Service Worker ← FCM web push
  └─ React Three Fiber → local/cached GLB mascot

Cloud Scheduler
  └─ protected scheduled function
       ├─ queries due reminder occurrences
       ├─ validates preferences, timezone, and quiet hours
       ├─ sends generic FCM payload
       └─ records idempotent delivery attempt
```

### 10.4 Rendering strategy

- Public shell and static informational content may be server-rendered or statically generated.
- Authenticated Firebase data can load client-side after auth state resolves.
- Avoid rendering user-specific private data into shared caches.
- Keep Firebase Admin SDK exclusively in trusted server/Cloud Functions code.
- Keep all secrets out of the client. Firebase web configuration is not a secret, but access must still be protected by Auth, Security Rules, App Check where appropriate, and server-side authorization.

### 10.5 3D asset requirements

- Use one optimized GLB with named animation clips such as `Idle`, `Wake`, `Wave`, `Drink`, `Eat`, `Sleep`, and `Celebrate` when available.
- Compress geometry with Draco or Meshopt and textures with KTX2/Basis where the build and browser support path is verified.
- Set a performance budget during implementation; aim for a small mobile download rather than a cinematic asset.
- Lazy-load the 3D scene after essential UI.
- Provide poster/static fallback for slow devices, errors, data-saving preferences, reduced motion, and browsers without WebGL.
- Cap device pixel ratio and shadows for mobile performance.
- Dispose of geometries/materials and stop the render loop when appropriate.
- Do not make navigation or essential actions dependent on interacting with the canvas.

---

## 11. Data Model

All timestamps stored in Firestore should use Firestore `Timestamp` in UTC. Store an IANA timezone separately for recurrence calculations. Document date keys use the user’s local calendar date in `YYYY-MM-DD` form.

### 11.1 Collections

```text
users/{uid}
users/{uid}/routines/{routineId}
users/{uid}/dailyLogs/{yyyy-mm-dd}
users/{uid}/dailyLogs/{yyyy-mm-dd}/events/{eventId}
users/{uid}/tummyEntries/{entryId}
users/{uid}/devices/{deviceId}
users/{uid}/reminderOccurrences/{occurrenceId}
users/{uid}/exports/{exportId}              # optional server job metadata
```

Do not store all user history in one ever-growing document. Keep sensitive data inside the user-owned hierarchy unless a server-only operational collection is necessary.

### 11.2 `users/{uid}`

```ts
interface UserProfile {
  uid: string;
  displayName?: string;
  timezone: string; // IANA, e.g. Asia/Yangon
  locale: "my" | "en";
  onboardingVersion: number;
  onboardingCompletedAt?: Timestamp;
  reducedMotionOverride?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 11.3 `routines/{routineId}`

Use one normalized model or discriminated union with strict validation.

```ts
type RoutineType = "hydration" | "meal" | "sleep";

interface RoutineBase {
  id: string;
  type: RoutineType;
  label: string;
  enabled: boolean;
  weekdays: number[]; // 0–6; define Sunday/Monday convention once
  timezone: string;
  reminderEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface MealRoutine extends RoutineBase {
  type: "meal";
  localTime: string; // validated HH:mm
  sortOrder: number;
}

interface HydrationRoutine extends RoutineBase {
  type: "hydration";
  mode: "interval" | "times";
  startLocalTime: string;
  endLocalTime: string;
  intervalMinutes?: number;
  localTimes?: string[];
  dailyTargetGlasses?: number;
  millilitersPerGlass?: number;
}

interface SleepRoutine extends RoutineBase {
  type: "sleep";
  bedtimeLocalTime: string;
  wakeLocalTime: string;
  windDownMinutes?: number;
}
```

### 11.4 Daily logs and events

```ts
interface DailyLog {
  localDate: string;
  timezone: string;
  hydrationCount: number; // derived/cache; events remain source of truth
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type DailyEventType =
  | "water"
  | "meal_completed"
  | "meal_skipped"
  | "bedtime_logged"
  | "wake_logged";

interface DailyEvent {
  id: string;
  type: DailyEventType;
  routineId?: string;
  occurredAt: Timestamp;
  clientRequestId: string; // idempotency for retries
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 11.5 Tummy entry

```ts
interface TummyEntry {
  id: string;
  occurredAt: Timestamp;
  timezone: string;
  intensity: number; // integer 0–10
  symptoms: Array<
    | "pain_cramp"
    | "bloating"
    | "nausea"
    | "heartburn"
    | "diarrhea"
    | "constipation"
    | "gas"
    | "other"
  >;
  location?: "upper" | "lower" | "left" | "right" | "all_over" | "unsure";
  durationMinutes?: number;
  mealRelation?: "before" | "after" | "unsure" | "not_specified";
  moodOrEnergy?: string;
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Constrain free-text lengths in both UI validation and Security Rules/server validation.

### 11.6 Device token

```ts
interface DeviceRegistration {
  id: string; // random device registration ID; never expose token as document ID
  fcmToken: string;
  platform: "web";
  permission: "granted";
  userAgentSummary?: string;
  enabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastSeenAt: Timestamp;
}
```

FCM tokens are sensitive identifiers. Never log them in plaintext in analytics or error messages.

### 11.7 Reminder occurrence

```ts
interface ReminderOccurrence {
  id: string; // deterministic hash/id from uid + routine + scheduled instant
  routineId: string;
  category: "hydration" | "meal" | "sleep";
  scheduledFor: Timestamp;
  status: "pending" | "processing" | "sent" | "skipped" | "failed";
  attemptCount: number;
  processedAt?: Timestamp;
  failureCode?: string; // sanitized, no token or private health content
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Use deterministic IDs or transactions so retries do not create duplicate pushes.

---

## 12. Reminder Scheduling Design

### 12.1 MVP approach

Use Cloud Scheduler to invoke a protected Cloud Function at a regular interval, for example every few minutes. The function processes reminder occurrences due within a bounded window.

Implementation options:

1. **Precompute occurrences:** On schedule change, generate upcoming occurrences for a limited horizon. Scheduler queries `pending` occurrences by `scheduledFor`. This is the preferred MVP pattern because the due query is simple and indexable.
2. **Compute on scan:** Periodically scan user routines and calculate whether each is due. This is simpler initially but scales poorly and makes timezone/DST handling harder.

Choose option 1 unless project constraints prove otherwise.

### 12.2 Required properties

- Idempotent processing with transactions or leases.
- A bounded batch size and retry strategy.
- Composite indexes committed to `firestore.indexes.json`.
- Generic lock-screen content with no symptom details.
- Invalid FCM token cleanup.
- Logs contain user ID only when operationally necessary and never include notes, symptom content, or tokens.
- Schedule regeneration on timezone/routine update.
- Correct behavior through daylight-saving transitions for relevant timezones.
- Expired occurrences are skipped rather than delivered hours late; define and test a grace window.
- The scheduled endpoint requires authenticated service-to-service invocation or an equivalent protected mechanism; it must not be an open public trigger.

### 12.3 Cost control

- Avoid full collection scans.
- Query indexed due occurrences only.
- Limit precomputation horizon, such as 7–14 days, and refill safely.
- Batch multicast sends where supported and appropriate.
- Establish Firebase budget alerts before public expansion.

---

## 13. Security and Privacy

### 13.1 Security requirements

- Deny Firestore access by default.
- Require `request.auth != null` for all private collections.
- A user may access only documents beneath `users/{request.auth.uid}`.
- Validate allowed fields, types, enum values, numeric ranges, array sizes, and string lengths in Security Rules.
- Prevent client writes to server-owned reminder status fields where practical.
- Use Firebase Admin SDK only in Cloud Functions/server environments.
- Use secret management/environment configuration for service credentials and private keys.
- Apply Firebase App Check where supported after development workflows are documented.
- Protect Cloud Functions with authentication/authorization and validate every input server-side.
- Use HTTPS only.
- Keep dependencies updated and review production audit results without blindly applying breaking upgrades.
- Add rate limits or abuse controls to callable/HTTP functions.
- Do not expose stack traces or internal IDs in user-facing messages.
- Separate dev/staging/prod Firebase projects where feasible.

### 13.2 Firestore Rules intent

Rules must enforce, at minimum:

```text
users/{uid}: authenticated owner can read; owner can update allowed profile fields.
subcollections: authenticated owner can read/write validated user-owned data.
devices: authenticated owner can create/update/delete validated device registrations.
reminderOccurrences: client may read if needed, but server controls processing/status fields.
```

Rules are not filters. Client queries must already be scoped to data the user is allowed to read. Add emulator-based tests covering allowed and denied reads/writes.

### 13.3 Privacy requirements

- Collect only data required for the documented features.
- Explain that symptom data and routine history are stored in the user’s account.
- Do not sell, advertise against, or unnecessarily share health-adjacent data.
- No third-party behavioral analytics in the MVP. If analytics are added later, use consent where required, minimize events, and never send symptom notes, exact health details, notification tokens, or free text.
- Define a retention policy before public release.
- Account deletion must remove Auth identity and associated Firestore data, including nested subcollections, via a trusted server process.
- Provide export before deletion when requested.
- State that deletion from backups/logs may follow the infrastructure provider’s documented retention lifecycle; do not promise instantaneous removal from every backup.
- Avoid storing sensitive details in notification payloads, URLs, logs, crash reports, or document IDs.

### 13.4 Medical safety boundary

Mochi is a routine companion and private journal—not a healthcare provider or medical device. It must not:

- Diagnose a condition.
- Rank likely diseases.
- Recommend medicine, dosage, supplements, or treatment.
- Interpret symptom combinations as proof of a condition.
- Discourage professional care.
- Claim emergencies will be detected or notifications will be delivered reliably.

---

## 14. PWA Requirements and Limitations

### 14.1 PWA requirements

- Valid web app manifest with name, short name, start URL, display mode, theme/background colors, and required icon sizes.
- HTTPS in production.
- Service worker with a documented update strategy.
- Cache the application shell and safe static assets.
- Provide a friendly offline page/state.
- Never cache one user’s private API/Firestore response in a way another user could receive.
- Show install guidance contextually; do not pressure or repeatedly prompt.
- Detect standalone display mode where useful.

### 14.2 Known limitations to communicate honestly

- PWA installation and UI vary by browser and operating system.
- Web push support and permission flows vary by browser/platform.
- On iOS/iPadOS, web push generally depends on supported OS/browser behavior and an installed Home Screen web app; implementation must verify current platform requirements before release.
- Browser notification permission can be denied permanently until changed in system/browser settings.
- Delivery timing is best-effort and may be delayed by OS power management, connectivity, browser policies, or device settings.
- Background code execution is limited; do not rely on the service worker as an exact local alarm clock.
- Notification action buttons and badges are not consistent across all platforms.
- Offline writes may sync later, but server-created schedules, cross-device sync, auth transitions, and push registration require network access.
- Storage can be evicted by the browser/OS; Firestore remains the source of truth for synced data.
- A PWA cannot guarantee native-app parity.

Platform behavior changes over time, so the coding agent must verify current official browser and Firebase documentation during implementation rather than relying solely on assumptions in this PRD.

---

## 15. Performance and Reliability

### 15.1 Performance targets

Targets should be measured on a representative mid-range mobile device and throttled mobile network:

- Essential UI is usable without waiting for the 3D model.
- Core Web Vitals should meet the “good” thresholds where practical.
- Lazy-load noncritical routes, 3D, and history views.
- Avoid shipping Firebase Admin or server-only code to the client.
- Keep client bundles and GLB asset within explicit budgets set and checked in CI.
- Use responsive images and local/subset fonts where licensing permits.

### 15.2 Reliability

- Optimistic actions use stable client request IDs to avoid duplicates.
- Offline/retry states are visible.
- Timestamps use server timestamps for authoritative creation/update metadata.
- Reminder delivery is idempotent.
- Error logging is sanitized.
- Important failures can be retried without data loss.

---

## 16. Validation and Error Handling

- Define shared schemas with a runtime validator such as Zod, or an equivalent maintained solution.
- Validate on client for usability, in Security Rules for Firestore access, and in Cloud Functions for trust boundaries.
- Trim and constrain notes; suggested MVP maximum is 500 characters.
- Intensity must be an integer from 0 through 10.
- Times must use validated 24-hour `HH:mm` format internally.
- Timezone must be a supported IANA zone.
- Weekday arrays must contain unique valid integers.
- Interval values must be bounded to prevent notification spam.
- Present field-specific, Burmese-friendly messages.
- Never discard valid form content because one field failed.

---

## 17. Testing Strategy

### 17.1 Unit tests

- Local date-key creation across timezones.
- Sleep duration crossing midnight.
- Reminder recurrence and quiet-hour logic.
- Daylight-saving transitions in representative zones.
- Validation schemas and copy selection.
- Deduplication/idempotency key generation.

### 17.2 Integration tests

- Firebase Auth state and protected route behavior.
- Firestore converters/repositories using Firebase Emulator Suite.
- Security Rules: owner access, cross-user denial, invalid fields/ranges, server-owned fields.
- Cloud Function reminder processing, retry, token cleanup, and deduplication.
- Account deletion removes nested data.

### 17.3 End-to-end tests

- Complete onboarding with notifications skipped.
- Sign in and sign out.
- Log and undo water.
- Complete/edit a meal state.
- Configure sleep across midnight.
- Create, edit, filter, and delete a tummy entry.
- Update timezone and verify future reminder regeneration.
- Offline shell and reconnection behavior.
- Reduced-motion fallback.
- 3D load failure fallback.

Push permission and actual delivery require manual tests on real target devices in addition to automated tests.

### 17.4 Accessibility and device matrix

- Keyboard-only pass.
- Screen-reader smoke test on at least one mobile and one desktop combination.
- 200% zoom and narrow-width test.
- Android Chromium-based browser.
- iPhone/iPad supported Safari/Home Screen PWA flow.
- Desktop Chromium, Safari, and Firefox for core functionality; document push differences.
- Low-power/reduced-motion and offline scenarios.

---

## 18. Analytics and Success Measures

No behavioral analytics are required for the private-gift MVP. Product quality can be assessed through consensual feedback and privacy-safe operational metrics.

If privacy-safe measurement is added later, useful measures include:

- Onboarding completion rate.
- Reminder opt-in rate by supported platform.
- Successful log actions versus sync errors.
- Crash-free sessions.
- Push send failure rate and invalid-token rate.
- User-controlled reminder disable rate, which may indicate excessive frequency.

Never measure success by increasing notification volume. Never include symptom content or free text in analytics.

---

## 19. MVP Acceptance Criteria

The MVP is accepted only when all applicable criteria below pass.

### 19.1 Product and onboarding

- [ ] First-time user can understand Mochi’s purpose and finish onboarding on a 360 px-wide screen.
- [ ] Gift reveal and medical/privacy explanation are present.
- [ ] Timezone is detected, confirmed, stored as IANA, and editable.
- [ ] Notification permission is requested only after an explicit user action.
- [ ] Denying notifications does not block the app.

### 19.2 Authentication and data isolation

- [ ] User can sign in, remain signed in across refresh, sign out, and delete the account.
- [ ] Protected pages do not expose private content before auth resolution.
- [ ] Firestore Rules tests prove one user cannot access another user’s profile, schedules, logs, symptoms, or devices.
- [ ] Invalid or oversized writes are rejected.

### 19.3 Daily routines

- [ ] User can configure hydration, meal, and sleep schedules.
- [ ] User can log water in no more than two taps from Today and undo the latest entry.
- [ ] User can mark meal status and correct it.
- [ ] Sleep schedules crossing midnight display and calculate correctly.
- [ ] Missed actions receive neutral, nonjudgmental copy.

### 19.4 Tummy tracking

- [ ] User can create, edit, view, filter, and delete an entry.
- [ ] Intensity and free text are validated.
- [ ] UI clearly states that tracking is not diagnosis or medical advice.
- [ ] No screen generates disease predictions, treatment, medication, or causal claims.

### 19.5 Reminders and push

- [ ] Supported browsers can register an FCM token after permission is granted.
- [ ] Device tokens are private and removable.
- [ ] A due reminder is processed once even when the scheduled function retries.
- [ ] Disabled categories and quiet hours are respected.
- [ ] Invalid FCM tokens are disabled or deleted.
- [ ] Push payloads do not expose symptom or meal details on the lock screen.
- [ ] UI states that delivery timing is best-effort.

### 19.6 PWA and offline

- [ ] Manifest and service worker pass basic installability checks on supported platforms.
- [ ] Essential app shell and an explanatory offline state load without network after first successful load.
- [ ] Private data is not leaked through shared caching.
- [ ] Install and push limitations are communicated per platform.

### 19.7 3D, performance, and accessibility

- [ ] Essential UI becomes usable independently of the GLB load.
- [ ] Missing WebGL, GLB failure, reduced motion, and low-performance modes have a usable static fallback.
- [ ] All core flows work by keyboard and with screen-reader labels.
- [ ] Touch targets, focus states, contrast, safe areas, and 200% zoom meet stated requirements.
- [ ] No essential information exists only inside the 3D canvas.

### 19.8 Quality and operations

- [ ] Unit, integration, Security Rules, and critical end-to-end tests pass in CI.
- [ ] Production build completes without TypeScript errors.
- [ ] Environment variables, Firebase setup, deployment, indexes, rules, and rollback steps are documented.
- [ ] No secrets or production credentials are committed.
- [ ] Error logs are sanitized of symptom notes and FCM tokens.

---

## 20. MVP Milestones

### Milestone 0 — Foundation and decisions

Deliverables:

- Confirm hosting/rendering strategy.
- Create Firebase dev project and emulator configuration.
- Define design tokens, typography, icon approach, and Burmese copy baseline.
- Add TypeScript strict mode, formatting, linting, tests, and CI.
- Write architecture decision notes for auth method, reminder precomputation, and offline strategy.

Exit criteria: app shell builds, CI passes, emulator starts, and no secrets are committed.

### Milestone 1 — App shell, auth, and onboarding

Deliverables:

- Responsive routes and bottom navigation.
- Firebase Auth integration.
- Protected-route behavior.
- Onboarding flow, timezone confirmation, privacy/medical explanation.
- User profile persistence.

Exit criteria: new user can sign in and complete onboarding on mobile without enabling notifications.

### Milestone 2 — Routine tracking

Deliverables:

- Today dashboard.
- Hydration, meals, and sleep schedule forms.
- Daily event logging and corrections.
- Offline/retry UI states.

Exit criteria: core routines pass unit/integration/E2E tests.

### Milestone 3 — Tummy journal

Deliverables:

- Entry form, validation, history, filtering, edit/delete.
- Non-diagnostic safety copy.
- Security Rules and emulator tests.

Exit criteria: private CRUD flow works and cross-user access is denied.

### Milestone 4 — Reminder backend and web push

Deliverables:

- Permission education and FCM registration.
- Device management.
- Occurrence generation.
- Protected scheduled processor with idempotency, retries, quiet hours, and token cleanup.
- Real-device push testing matrix and limitations copy.

Exit criteria: one scheduled reminder can be delivered on supported test devices without duplicate sends or sensitive payload content.

### Milestone 5 — Mochi 3D experience and PWA polish

Deliverables:

- Optimized GLB scene and state-driven animation.
- Static/reduced-motion/WebGL failure fallbacks.
- Manifest, icons, service worker, offline page, safe areas, install help.
- Performance budgets and checks.

Exit criteria: mascot enriches the experience but never blocks it; install/offline checks pass where supported.

### Milestone 6 — Privacy, accessibility, and release

Deliverables:

- Export and server-side account deletion.
- Privacy/disclaimer screens.
- Accessibility/device QA.
- Production Firebase rules/indexes/functions deployment plan.
- Monitoring, budget alerts, support and rollback notes.

Exit criteria: every MVP acceptance criterion is checked with evidence and release blockers are resolved.

---

## 21. Actionable Coding-Agent Instructions

These instructions are for the AI coding agent using this PRD.

### 21.1 Working rules

1. Read this entire PRD before creating code.
2. Inspect the existing repository and preserve user changes. Do not overwrite unrelated work.
3. Look for and obey repository instructions such as `AGENTS.md`, existing conventions, and deployment configuration.
4. Before implementation, produce a short build plan that maps work to the MVP milestones and identifies unresolved decisions.
5. If the repository is empty, scaffold the smallest maintainable Next.js + TypeScript + Tailwind foundation needed for Milestone 0.
6. Use supported stable dependencies available at implementation time. Verify technical claims in official Next.js, Firebase, browser, React Three Fiber, and relevant platform documentation.
7. Do not claim that ChatGPT 5.6 Soul or Terra can perform a capability unless it is actually available and verified in the user’s environment. The model choice does not change product requirements.
8. Implement vertical slices. Finish, test, and document one coherent flow before expanding.
9. Do not place business logic, timezone recurrence, or Firebase writes directly throughout UI components. Use typed services/repositories and testable pure functions.
10. Keep server-only modules and secrets outside client bundles.
11. Use Firebase Emulator Suite for Auth/Firestore/Functions development and rule tests where supported.
12. Do not deploy, enable billing, create production cloud resources, or send real notifications without the user’s explicit authorization.
13. Never invent production Firebase values. Provide `.env.example` placeholders and setup instructions.
14. Stop and ask when a choice materially changes privacy, cost, authentication, deployment, or data retention.

### 21.2 Required implementation sequence

1. **Repository audit** — report current framework, package manager, tests, Firebase files, design assets, and conflicts.
2. **Architecture decisions** — record chosen auth fallback, hosting/rendering approach, reminder occurrence strategy, validation library, test tools, and service-worker approach.
3. **Typed domain layer** — define schemas, converters, date/time helpers, and error types.
4. **Security first** — create restrictive Firestore Rules and emulator tests alongside each data feature.
5. **Mobile UI shell** — implement routes, navigation, loading/empty/error/offline states, accessibility foundations.
6. **Onboarding and auth** — complete the first end-to-end vertical slice.
7. **Routine features** — hydration, meals, sleep, then Today aggregation.
8. **Tummy journal** — CRUD and safety copy, without diagnostic logic.
9. **Reminders** — permission UX, device registration, precomputation, scheduler processor, idempotency, cleanup.
10. **3D and PWA** — add only after essential flows are stable; measure bundle and asset impact.
11. **Privacy operations** — export and recursive deletion with recent-auth handling.
12. **Release verification** — acceptance checklist, real-device matrix, production build, rules/index review, and rollback documentation.

### 21.3 Definition of done for every feature

A feature is not done until it includes:

- Typed implementation with no unexplained `any`.
- Client and trust-boundary validation.
- Loading, empty, offline, error, and success behavior as applicable.
- Accessible labels, focus handling, and keyboard support.
- Responsive behavior at 360 px and larger.
- Security Rules and tests when Firestore data is involved.
- Unit/integration/E2E coverage proportional to risk.
- Burmese-friendly user copy reviewed for gentle tone.
- Documentation for configuration or operational steps.
- No secrets, sensitive logs, or medical claims.

### 21.4 Agent verification commands

Use the repository’s selected package manager and actual script names. The final implementation should expose equivalents of:

```text
format/check formatting
lint
typecheck
unit tests
rules/emulator tests
end-to-end tests
production build
```

Report exact results and remaining warnings. Do not say “all tests pass” without running them.

### 21.5 Required handoff after each milestone

Provide:

- What changed.
- Which PRD requirements and acceptance criteria are satisfied.
- Files or areas most relevant for review.
- Tests run and results.
- Screenshots or short recordings for meaningful UI changes where the environment permits.
- Firebase/emulator setup needed by the user.
- Known limitations, risks, and next milestone.

---

## 22. Open Decisions Before Production

These do not block writing the MVP foundation, but they must be resolved before production release:

1. Exact sign-in fallback: email link versus email/password.
2. Hosting choice and supported Next.js feature set.
3. Final GLB source, animation clips, licensing, size budget, and fallback art.
4. Final Burmese/English copy review and language-switch scope.
5. Data retention period and support/contact identity.
6. Export format and delivery flow.
7. Reminder grace window, precomputation horizon, and maximum allowed frequency.
8. Target browser/OS minimum versions verified against current official support.
9. Whether this remains a private single-recipient gift or becomes a public multi-user product.
10. Privacy policy and any legal/compliance review needed for the intended launch region.

---

## 23. Post-MVP Possibilities

Only consider these after the MVP is stable and privacy-reviewed:

- More Mochi outfits or seasonal idle animations.
- Optional weekly factual summaries with no medical inference.
- Calendar-style symptom history.
- User-authored reminder phrases.
- Trusted-person sharing with granular, revocable consent.
- Native app wrapper only if PWA platform limits materially harm the experience.
- Health platform integrations after dedicated privacy and compliance review.

---

## 24. Final Product Standard

Mochi succeeds when the recipient feels quietly cared for, can log a routine in seconds, stays in control of notifications and private data, and never mistakes the app for medical advice. The product should be emotionally charming, technically modest, secure by default, and honest about what a PWA and web push can—and cannot—guarantee.

