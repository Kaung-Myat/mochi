# Local development

## Prerequisites

- Node.js 20.9 or later.
- A Java runtime for the Firestore Emulator.
- A Firebase project is **not** required for the local `demo-mochi` Emulator Suite.

## Setup

1. Copy `.env.example` to `.env.local` and add Firebase Web app configuration when Phase 1 starts.
2. Install root dependencies: `npm install`.
3. Run `npm run dev` for the web app.
4. Run `npm run emulators` separately for Auth, Firestore, and the Emulator UI.

## Verification

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:rules`
- `npm run build`

Profiles, routines, events, tummy entries, notification devices, and reminder preferences have
owner-only Rules and Emulator coverage. Reminder occurrences and operational rate-limit documents
remain server-owned.

Web Push requires a non-empty `NEXT_PUBLIC_FIREBASE_VAPID_KEY`. Permission is requested only from
the notification settings button. Production reminder routes require Firebase Admin credentials and
QStash signing keys as server-only Vercel secrets. QStash should call
`POST /api/reminders/process` every five minutes; direct unsigned requests are rejected.
