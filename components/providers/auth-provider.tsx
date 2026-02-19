"use client";

import * as React from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

import {
  ensureUserProfile,
  getFirebaseErrorMessage,
  handleGoogleRedirectResult,
  logout,
} from "@/lib/auth";
import { getFirebaseClientOptional, getFirebaseEnvStatus } from "@/lib/firebase";
import type { UserDoc, UserPrefsDoc, UserProfileDoc, UserRole } from "@/lib/db";

export type UserProfile = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  profile: UserProfileDoc | null;
  prefs: UserPrefsDoc | null;
  role: UserRole;
  createdAt: Date;
};

export type AuthContextValue = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  configError: string | null;
  profileError: string | null;
  signOut: () => Promise<void>;
};

export const AuthContext = React.createContext<AuthContextValue | null>(null);

function toProfile(uid: string, doc: UserDoc): UserProfile {
  const createdAt =
    typeof (doc.createdAt as Timestamp | undefined)?.toDate === "function"
      ? (doc.createdAt as Timestamp).toDate()
      : new Date(0);

  return {
    uid,
    displayName: doc.displayName ?? null,
    email: doc.email ?? null,
    photoURL: doc.photoURL ?? null,
    profile: doc.profile ?? null,
    prefs: doc.prefs ?? null,
    role: doc.role,
    createdAt,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [configError, setConfigError] = React.useState<string | null>(null);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const status = getFirebaseEnvStatus();
    if (!status.ok) {
      setConfigError(status.message);
      setLoading(false);
      return;
    }

    const client = getFirebaseClientOptional();
    if (!client) {
      setConfigError("Firebase is not configured.");
      setLoading(false);
      return;
    }

    const { auth, ensureAuthPersistence } = client;
    void ensureAuthPersistence();
    void handleGoogleRedirectResult().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setProfileError(null);
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const doc = await ensureUserProfile(user);
        setProfile(toProfile(user.uid, doc));
        setProfileError(null);
      } catch (err) {
        setProfile(null);
        setProfileError(getFirebaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = React.useMemo<AuthContextValue>(() => {
    return {
      firebaseUser,
      profile,
      loading,
      isAdmin: profile?.role === "admin",
      configError,
      profileError,
      signOut: logout,
    };
  }, [firebaseUser, profile, loading, configError, profileError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
