# Mochi — Implementation Plan

## Current repository status

The repository currently contains the product requirements document only. This plan therefore starts with a clean, minimal foundation.

## 0. Foundation and technical decisions

Set up a minimal Next.js + TypeScript + Tailwind PWA project with strict typing, formatting, linting, unit tests, end-to-end tests, and CI.

Decide and document:

- Firebase Hosting strategy compatible with the chosen Next.js rendering model.
- Email/password versus email-link authentication fallback.
- Firestore-backed, precomputed reminder occurrences (recommended).
- Zod for validation.
- Firebase Emulator Suite for Auth, Firestore, and Security Rules.
- PWA service-worker and update strategy.
- Initial performance budgets for JavaScript and Mochi's `.glb` asset.

Deliverables: `.env.example`, Firebase emulator configuration, restrictive Firestore Rules skeleton, architecture notes, and a buildable mobile shell.

## 1. Typed domain and security baseline

Create the shared domain layer before screens:

- Typed models and runtime schemas for profiles, routines, daily events, tummy entries, devices, and reminder occurrences.
- Pure date/time helpers using IANA timezones, including midnight and daylight-saving transitions.
- Firestore converters and repositories kept separate from UI components.
- Client request IDs for idempotent routine logging.
- Firestore Rules and emulator tests covering owner-only access, invalid inputs, field limits, and server-owned reminder fields.

This establishes private-by-default data handling before user features are added.

## 2. Mobile shell, authentication, and onboarding

Build the responsive structure and first end-to-end vertical slice:

- Routes, protected-route handling, bottom navigation, loading/error/offline states.
- Firebase sign-in, sign-out, persisted sessions, and clear error states.
- Onboarding with Burmese-friendly copy, privacy and medical disclaimer, nickname, timezone confirmation, initial routines, notification education, and optional installation guidance.
- Save onboarding progress after every step; do not block completion if notification permission is denied.
- Today screen placeholder and profile persistence.

Exit condition: a user can sign in, complete onboarding on a 360px-wide screen, and safely land on Today.

## 3. Core routine tracking

Implement the practical daily-use features:

- Hydration target/configuration, one-tap water logging, and undo for the most recent water event.
- Meal schedule management: create, rename, reorder, enable/disable, eat/skip/correct, and optional note.
- Sleep schedule with bedtime/wake times, midnight-crossing support, wind-down/wake reminders, and optional logged sleep timestamps.
- Today dashboard aggregation: greeting, next reminder, hydration progress, meal state, sleep state, and quick tummy action.
- Optimistic updates with visible retry and recovery states.

Exit condition: routine flows work online and degrade clearly offline, with unit, integration, and end-to-end coverage.

## 4. Tummy journal

Build a deliberately non-diagnostic private journal:

- Create, edit, delete, and filter entries.
- Validate intensity, tags, optional timing/location/duration, and 500-character notes.
- Present neutral history and factual counts only.
- Keep the medical-safety note persistent and provide a general message encouraging qualified care for worrying symptoms.
- Add Security Rules tests for all CRUD paths.

Exit condition: the journal is useful and private, without diagnosis, treatment, or causal claims.

## 5. Reminder backend and web push

Implement reminders after the core app is stable:

- Notification explanation screen and permission request initiated only by user action.
- FCM token registration, private device records, test notification, sign-out cleanup, and invalid-token cleanup.
- Generate a 7–14 day horizon of deterministic reminder occurrences when routines or timezone change.
- QStash-signed Vercel Node route that processes indexed due occurrences on a five-minute schedule.
- Transaction or lease-based deduplication, quiet-hour checks, disabled-category checks, grace-window expiry, retries, and sanitized logs.
- Generic lock-screen payloads and deep links; never include meal or symptom details.

Exit condition: a supported real device receives one test reminder without duplicate sends or sensitive-content exposure.

## 6. Mochi 3D, PWA, and visual polish

Add the mascot after the app is fully usable without it:

- Integrate an optimized React Three Fiber `.glb` model with state-driven animation.
- Lazy-load it after core UI.
- Provide a static fallback for reduced motion, weak devices, WebGL failure, data saver, or loading errors.
- Create manifest, icons, install guidance, safe-area support, service worker, app-shell caching, and a friendly offline screen.
- Ensure private user content is never shared through caches.
- Measure and enforce bundle and asset budgets.

Exit condition: Mochi enriches the experience but no feature depends on 3D.

## 7. Privacy operations, accessibility, and release readiness

Finish the app as a responsible private product:

- JSON data export.
- Server-side recursive account deletion with recent-authentication handling.
- Settings for timezone, language, reduced motion, and reminders.
- Accessibility pass: keyboard use, focus management, screen-reader labels, contrast, 200% zoom, touch targets, and Burmese text rendering.
- Real-device/browser QA for Android Chromium, iOS/iPadOS Home Screen PWA, and desktop browsers.
- Deployment, rollback, Firebase budget-alert, support, and limitation documentation.

Exit condition: every PRD acceptance criterion has evidence, tests pass, and real-device limitations are documented honestly.

## Recommended build order

1. Foundation and Firebase Emulator.
2. Authentication and onboarding.
3. Hydration and Today dashboard.
4. Meals and sleep.
5. Tummy journal.
6. Reminders and FCM.
7. PWA and 3D Mochi.
8. Export/deletion, accessibility, and release QA.

## Decisions needed before production

The MVP foundation can proceed with sensible defaults, but these require confirmation before release:

- Email/password or email-link sign-in fallback.
- Firebase Hosting approach.
- Final Mochi GLB asset, license, animations, and size budget.
- Reminder grace period, maximum frequency, and scheduling horizon.
- Retention policy, support contact, and privacy-policy language.
- Whether this remains a private gift or becomes publicly available.
