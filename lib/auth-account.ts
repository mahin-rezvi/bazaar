import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  type User,
} from "firebase/auth";

import { ensureUserProfile, sendResetPasswordEmail } from "@/lib/auth";

export async function sendPasswordResetToCurrentEmail(user: User) {
  const email = user.email;
  if (!email) throw new Error("No email on this account.");
  await sendResetPasswordEmail(email);
}

export async function changeEmail({
  user,
  newEmail,
  currentPassword,
}: {
  user: User;
  newEmail: string;
  currentPassword: string;
}) {
  const email = user.email;
  if (!email) throw new Error("No email on this account.");
  const credential = EmailAuthProvider.credential(email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updateEmail(user, newEmail);
  await ensureUserProfile(user, newEmail);
}
