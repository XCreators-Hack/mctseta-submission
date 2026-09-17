import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True once the required public Firebase env vars are present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// When env vars are missing (e.g. before the hackathon team has plugged in
// their Firebase project), fall back to a syntactically valid but inert
// placeholder config so the SDK doesn't throw during module init / SSR.
// All real reads/writes are still gated behind `isFirebaseConfigured` in the
// hooks and AuthContext, so this placeholder is never actually used.
const effectiveConfig: FirebaseOptions = isFirebaseConfigured
  ? firebaseConfig
  : {
      apiKey: "demo-mode-placeholder-key",
      authDomain: "demo.firebaseapp.com",
      projectId: "demo-project",
      appId: "1:0:web:0",
    };

// Guard against re-initializing during Next.js hot reload.
export const firebaseApp = getApps().length ? getApp() : initializeApp(effectiveConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
