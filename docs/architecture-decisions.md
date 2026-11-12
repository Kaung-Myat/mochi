# Architecture decisions — Phase 0

## ADR-001: Rendering and hosting

**Decision:** Use the Next.js App Router on Vercel Hobby for production, with Firebase Spark for
Authentication, Firestore, and Cloud Messaging.

**Why:** Authenticated views and protected reminder endpoints run together on Vercel while Firebase
remains the private data and messaging platform. Private user data loads only after Firebase
Authentication resolves and is never added to shared caches.

**Status:** Accepted for the MVP foundation. Production provisioning and deployment are deferred.

## ADR-002: Authentication fallback

**Decision:** Use Google sign-in where available, with email/password as the MVP fallback.

**Why:** It works across target browsers without email-link domain and cross-device completion risk.

**Status:** Accepted; implementation is Phase 1.

## ADR-003: Reminder scheduling

**Decision:** Precompute 14 days of deterministic reminder occurrences whenever routines or timezones
change. QStash invokes a signature-verified Vercel route every five minutes to process indexed due
occurrences.

**Why:** This enables bounded queries, idempotency, timezone handling, and avoids collection scans.

**Status:** Implemented in Phase 5. Occurrences use deterministic IDs, a 14-day horizon, and a
lease-based scheduled processor with bounded batches, expiry, retries, and invalid-token cleanup.

## ADR-004: Validation and data boundaries

**Decision:** Use Zod for client and Vercel server validation. Firestore Security Rules form an
independent access and shape boundary.

**Status:** Accepted and applied across profiles, routines, journal entries, devices, and reminder
preferences.

## ADR-005: Offline and service worker approach

**Decision:** Cache only the public application shell and safe static assets; never private Firestore responses in shared HTTP caches. Firestore remains the synced source of truth.

**Status:** The FCM service worker is implemented in Phase 5. Broader PWA app-shell caching remains
deferred to Phase 6.

## ADR-006: Web push privacy boundary

**Decision:** Store FCM tokens only in owner-scoped random-ID device documents, use generic
lock-screen copy, and deep-link only to `/today`. Never include routine labels, journal content, or
free text in push payloads or operational logs.

**Status:** Implemented with Firebase Admin in Vercel Node routes and QStash signature verification.
Real-device delivery still requires Vercel server secrets, a QStash schedule, and an iPhone Home Screen
installation.
