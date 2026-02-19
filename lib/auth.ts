import {
  User,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getRedirectResult,
  getIdTokenResult,
  reload,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { getFirebaseClient } from "@/lib/firebase";
import { userDoc, type UserDoc } from "@/lib/db";

async function resolveUserEmail(user: User): Promise<string | null> {
  const direct = user.email ?? user.providerData.find((p) => p.email)?.email ?? null;
  if (direct) return direct;
  try {
    const token = await getIdTokenResult(user, true);
    const claim = token.claims.email;
    return typeof claim === "string" && claim.length ? claim : null;
  } catch {
    return null;
  }
}

function buildGoogleProvider(prompt: string) {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  provider.setCustomParameters({ prompt });
  return provider;
}

export async function ensureUserProfile(
  user: User,
  emailOverride?: string | null,
): Promise<UserDoc> {
  getFirebaseClient();
  const ref = userDoc(user.uid);
  const snap = await getDoc(ref);
  const resolvedEmail = emailOverride ?? (await resolveUserEmail(user));
  if (snap.exists()) {
    const existing = snap.data();
    // Keep basic fields in sync with Auth (role remains controlled by Firestore/admin).
    const patch: Partial<UserDoc> = {
      displayName: user.displayName ?? null,
      email: resolvedEmail ?? null,
      photoURL: user.photoURL ?? null,
    };
    const profileIsMap =
      !!existing.profile && typeof existing.profile === "object" && !Array.isArray(existing.profile);
    const prefsIsMap =
      !!existing.prefs && typeof existing.prefs === "object" && !Array.isArray(existing.prefs);
    if (!profileIsMap) patch.profile = {};
    if (!prefsIsMap) patch.prefs = { marketingEmail: false };
    if (existing.role !== "admin" && existing.role !== "user") patch.role = "user";

    await setDoc(ref, patch, { merge: true });
    const fresh = await getDoc(ref);
    return fresh.data() ?? existing;
  }

  const doc: UserDoc = {
    displayName: user.displayName ?? null,
    email: resolvedEmail ?? null,
    photoURL: user.photoURL ?? null,
    profile: {},
    prefs: { marketingEmail: false },
    role: "user",
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, doc, { merge: false });

  const fresh = await getDoc(ref);
  return fresh.data() ?? doc;
}

export async function signUpWithEmail({
  displayName,
  email,
  password,
}: {
  displayName: string;
  email: string;
  password: string;
}) {
  const { auth } = getFirebaseClient();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await updateProfile(cred.user, { displayName });
    await ensureUserProfile(cred.user);
    return cred.user;
  } catch (err) {
    // Avoid leaving an auth user without a Firestore profile when possible.
    try {
      await deleteUser(cred.user);
    } catch {
      // ignore rollback failure
    }
    throw err;
  }
}

export async function signInWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { auth } = getFirebaseClient();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function signInWithGoogle() {
  const { auth } = getFirebaseClient();
  const provider = buildGoogleProvider("select_account");
  const consentProvider = buildGoogleProvider("consent select_account");

  async function completeSignIn(selectedProvider: GoogleAuthProvider) {
    const cred = await signInWithPopup(auth, selectedProvider);
    const email = await resolveUserEmail(cred.user);
    if (!email) {
      // Allow sign-in to proceed, but warn; some accounts/providers may not return email.
      // Email-based features will be limited in this case.
      // eslint-disable-next-line no-console
      console.warn("Google sign-in returned no email for this account.");
    }
    await ensureUserProfile(cred.user, email);
    return cred.user;
  }
  try {
    return await completeSignIn(provider);
  } catch (err: unknown) {
    const code = getAuthErrorCode(err);
    if (code === "auth/missing-email") {
      try {
        // Force a consent prompt to ensure the email scope is granted.
        return await completeSignIn(consentProvider);
      } catch (retryErr: unknown) {
        const retryCode = getAuthErrorCode(retryErr);
        if (
          retryCode === "auth/popup-blocked" ||
          retryCode === "auth/operation-not-supported-in-this-environment"
        ) {
          await signInWithRedirect(auth, consentProvider);
          return null;
        }
        throw retryErr;
      }
    }
    // Some browsers/environments block popups; redirect is more reliable.
    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
  }
}

export async function sendResetPasswordEmail(email: string) {
  const { auth } = getFirebaseClient();
  await sendPasswordResetEmail(auth, email);
}

export async function logout() {
  const { auth } = getFirebaseClient();
  await signOut(auth);
}

export async function refreshUser(user: User) {
  await reload(user);
  return user;
}

export function getAuthErrorCode(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  const anyErr = err as { code?: unknown };
  return typeof anyErr.code === "string" ? anyErr.code : null;
}

export function getAuthErrorMessage(err: unknown): string {
  const code = getAuthErrorCode(err);
  switch (code) {
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled in Firebase Auth.";
    case "auth/configuration-not-found":
      return (
        "Google sign-in provider configuration is missing for this Firebase project. " +
        "Enable Google under Firebase Console → Authentication → Sign-in method, set the support email, and save."
      );
    case "auth/unauthorized-domain":
      return "This domain is not authorized for OAuth (add it in Firebase Auth settings).";
    case "auth/missing-email":
      return "Google did not return an email for this account. Use another Google account or ensure the provider can share email.";
    case "auth/email-already-in-use":
      return "This email is already in use. Try signing in instead.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/weak-password":
      return "Password is too weak (min 6 characters).";
    case "auth/popup-blocked":
      return "Popup was blocked. Redirecting to Google…";
    case "auth/popup-closed-by-user":
      return "Popup was closed before completing sign-in.";
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled. Try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return code ? `Google sign-in failed (${code}).` : "Google sign-in failed.";
  }
}

export function getFirebaseErrorMessage(err: unknown): string {
  const code = getAuthErrorCode(err);
  if (code?.startsWith("auth/")) return getAuthErrorMessage(err);

  if (!err || typeof err !== "object") return "Something went wrong.";
  const anyErr = err as { code?: unknown; message?: unknown };
  const fsCode = typeof anyErr.code === "string" ? anyErr.code : null;

  switch (fsCode) {
    case "permission-denied":
      return "Permission denied. Ensure Firestore rules are published and your project is configured correctly.";
    case "failed-precondition":
      return "Firestore is not ready. Create Firestore Database in Firebase Console and try again.";
    case "unavailable":
      return "Firestore is temporarily unavailable. Try again.";
    default:
      return typeof anyErr.message === "string" && anyErr.message
        ? anyErr.message
        : "Something went wrong.";
  }
}

export async function handleGoogleRedirectResult() {
  const { auth } = getFirebaseClient();
  const res = await getRedirectResult(auth);
  if (res?.user) {
    const email = await resolveUserEmail(res.user);
    if (!email) {
      // eslint-disable-next-line no-console
      console.warn("Google redirect sign-in returned no email for this account.");
    }
    await ensureUserProfile(res.user, email);
    return res.user;
  }
  return null;
}
