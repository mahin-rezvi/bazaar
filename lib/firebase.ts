import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

type FirebaseClient = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  googleProvider: GoogleAuthProvider;
  ensureAuthPersistence: () => Promise<void>;
};

export type FirebaseEnvStatus =
  | { ok: true }
  | { ok: false; missing: readonly string[]; message: string };

export function getFirebaseEnvStatus(): FirebaseEnvStatus {
  // IMPORTANT: Next.js only inlines NEXT_PUBLIC_* vars for direct property access.
  // Avoid `process.env[key]` here, otherwise client bundles will always look "missing".
  const values = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  } as const;

  const missing = Object.entries(values)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (!missing.length) return { ok: true };
  return {
    ok: false,
    missing,
    message:
      `Firebase env is missing: ${missing.join(", ")}.\n` +
      `Create .env.local (copy from .env.local.example) and restart the dev server.`,
  };
}

export function getFirebaseClientOptional(): FirebaseClient | null {
  const status = getFirebaseEnvStatus();
  if (!status.ok) return null;

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope("email");
  googleProvider.addScope("profile");
  googleProvider.setCustomParameters({ prompt: "select_account" });

  return {
    app,
    auth,
    db,
    storage,
    googleProvider,
    ensureAuthPersistence: async () => {
      if (typeof window === "undefined") return;
      await setPersistence(auth, browserLocalPersistence);
    },
  };
}

export function getFirebaseClient(): FirebaseClient {
  const client = getFirebaseClientOptional();
  if (client) return client;
  const status = getFirebaseEnvStatus();
  throw new Error(status.ok ? "Firebase env missing." : status.message);
}
