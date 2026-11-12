# Free deployment — Vercel Hobby + Firebase Spark + QStash

This path does not require Firebase Blaze or Cloud Functions.

## 1. Firebase server credential

Create a dedicated server credential from Firebase Console → Project settings → Service accounts.
Download the JSON once and keep it private. Never commit it or place its values in variables beginning
with `NEXT_PUBLIC_`.

Map these JSON fields to Vercel **Secret** environment variables:

- `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
- `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
- `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

Keep the existing Firebase Web values and VAPID public key as `NEXT_PUBLIC_*` variables.
Set `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false` for Vercel production.

## 2. Deploy Firestore configuration

The device and preference rules plus reminder indexes work on Firebase Spark:

```bash
npx firebase deploy --only firestore:rules,firestore:indexes --project mochi-3fe9b
```

## 3. Deploy to Vercel

Import the repository into a personal Vercel Hobby project. Add all variables from `.env.example` to
the Vercel project, selecting **Secret** for Firebase Admin and QStash credentials. Redeploy after any
environment-variable change.

## 4. Create the QStash schedule

1. Create a free Upstash account and open QStash.
2. Copy the current and next signing keys to the Vercel secrets
   `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY`.
3. Create one schedule with:
   - Destination: `https://YOUR_DOMAIN/api/reminders/process`
   - Method: `POST`
   - Cron: `*/5 * * * *`
4. Redeploy Vercel after adding the signing keys.

The endpoint validates the QStash signature. Unsigned calls are rejected. Five-minute polling uses
288 QStash messages per day, below the free tier's 1,000-message daily limit before retries.

## 5. iPhone setup and test

1. Use iOS 16.4 or newer and open the production HTTPS URL in Safari.
2. Share → Add to Home Screen.
3. Open Mochi from its Home Screen icon, sign in, then open Settings → Notifications.
4. Tap the enable button. Permission is requested only from this user action.
5. In iPhone Settings → Notifications → Mochi, enable Lock Screen, Notification Center, Banners, and
   Sounds. Check that Focus is not silencing Mochi.
6. Return to Mochi, tap the test button, and put the app in the background.

The server sends Web Push with `Urgency: high`, but iOS remains in control of banner presentation,
Focus, sound, delivery timing, and power-management behavior.
