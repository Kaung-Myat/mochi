import { FirebaseError, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getFirebaseConfig, useFirebaseEmulators } from "./config";

interface FirebaseClient {
  app: ReturnType<typeof initializeApp>;
  auth: ReturnType<typeof getAuth>;
  db: ReturnType<typeof initializeFirestore>;
}

let client: FirebaseClient | undefined;

export function getFirebaseClient(): FirebaseClient {
  if (client) return client;

  const app = getApps()[0] ?? initializeApp(getFirebaseConfig());
  const auth = getAuth(app);
  let db: ReturnType<typeof initializeFirestore>;
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      // Some Myanmar ISPs and VPN/proxy paths buffer Firestore's streaming
      // WebChannel indefinitely. Long-polling trades a little performance for
      // a much more reliable connection on those networks.
      experimentalForceLongPolling: !useFirebaseEmulators,
    });
  } catch (error) {
    if (!(error instanceof FirebaseError) || error.code !== "failed-precondition") throw error;
    db = getFirestore(app);
  }

  if (useFirebaseEmulators) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }

  client = { app, auth, db };
  return client;
}
