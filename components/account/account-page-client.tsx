"use client";

import * as React from "react";
import { updateProfile, type User, EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from "firebase/auth";
import { updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Camera,
  CircleUser,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Shield,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { getFirebaseErrorMessage } from "@/lib/auth";
import { uploadPublicImage } from "@/lib/firestore/storage";
import { userDoc } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const profileSchema = z.object({
  displayName: z.string().min(2).max(50),
  phone: z.string().max(40).optional().or(z.literal("")),
  addressLine1: z.string().max(120).optional().or(z.literal("")),
  addressLine2: z.string().max(120).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  postalCode: z.string().max(30).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

const prefsSchema = z.object({
  marketingEmail: z.boolean(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    path: ["newPassword"],
    message: "New password must be different",
  });

function initialsFrom(label: string) {
  const parts = label.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

async function reauthWithPassword(user: User, currentPassword: string) {
  const email = user.email;
  if (!email) throw new Error("This account has no email (cannot re-auth with password).");
  const cred = EmailAuthProvider.credential(email, currentPassword);
  await reauthenticateWithCredential(user, cred);
}

export function AccountPageClient() {
  const { firebaseUser, profile, profileError, signOut } = useAuth();
  const [busy, setBusy] = React.useState(false);

  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  const [newEmail, setNewEmail] = React.useState("");
  const [emailPassword, setEmailPassword] = React.useState("");

  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleteConfirm, setDeleteConfirm] = React.useState("");

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName ?? firebaseUser?.displayName ?? "",
      phone: profile?.profile?.phone ?? "",
      addressLine1: profile?.profile?.addressLine1 ?? "",
      addressLine2: profile?.profile?.addressLine2 ?? "",
      city: profile?.profile?.city ?? "",
      country: profile?.profile?.country ?? "",
      postalCode: profile?.profile?.postalCode ?? "",
      notes: profile?.profile?.notes ?? "",
    },
  });

  const prefsForm = useForm<z.infer<typeof prefsSchema>>({
    resolver: zodResolver(prefsSchema),
    defaultValues: {
      marketingEmail: profile?.prefs?.marketingEmail ?? false,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  React.useEffect(() => {
    if (!firebaseUser) return;
    profileForm.reset({
      displayName: profile?.displayName ?? firebaseUser.displayName ?? "",
      phone: profile?.profile?.phone ?? "",
      addressLine1: profile?.profile?.addressLine1 ?? "",
      addressLine2: profile?.profile?.addressLine2 ?? "",
      city: profile?.profile?.city ?? "",
      country: profile?.profile?.country ?? "",
      postalCode: profile?.profile?.postalCode ?? "",
      notes: profile?.profile?.notes ?? "",
    });
    prefsForm.reset({
      marketingEmail: profile?.prefs?.marketingEmail ?? false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid, profile?.photoURL, profile?.displayName]);

  React.useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  if (!firebaseUser) return null;

  const label =
    profile?.displayName ||
    profile?.email ||
    firebaseUser.displayName ||
    firebaseUser.email ||
    "Account";
  const photoURL = profile?.photoURL || firebaseUser.photoURL || null;

  const createdAt = firebaseUser.metadata.creationTime
    ? new Date(firebaseUser.metadata.creationTime)
    : null;
  const lastSignIn = firebaseUser.metadata.lastSignInTime
    ? new Date(firebaseUser.metadata.lastSignInTime)
    : null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Profile settings</h1>
          <p className="text-sm text-muted-foreground">
            Keep your account secure and your details up to date.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await signOut();
                toast.success("Signed out.");
              } catch (err) {
                toast.error(getFirebaseErrorMessage(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {profileError ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-destructive" />
              Profile sync blocked
            </CardTitle>
            <CardDescription>
              You’re signed in, but Firestore profile read/write is failing.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{profileError}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={photoPreview || photoURL}
                alt="Profile photo"
                fallback={initialsFrom(label)}
                className="h-16 w-16"
              />
              <div className="min-w-0">
                <div className="truncate text-base font-semibold">{label}</div>
                <div className="text-sm text-muted-foreground">
                  {profile?.role ? `Role: ${profile.role}` : "Signed in"}
                  {createdAt ? ` · Joined ${createdAt.toLocaleDateString()}` : ""}
                  {lastSignIn ? ` · Last sign-in ${lastSignIn.toLocaleDateString()}` : ""}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="sm:w-[260px]"
              />
              <Button
                variant="outline"
                disabled={busy || !photoFile}
                onClick={async () => {
                  if (!photoFile) return;
                  setBusy(true);
                  try {
                    const url = await uploadPublicImage({
                      file: photoFile,
                      path: `user_avatars/${firebaseUser.uid}/${Date.now()}-${photoFile.name}`.replace(
                        /\s+/g,
                        "-",
                      ),
                    });
                    await updateProfile(firebaseUser, { photoURL: url });
                    await updateDoc(userDoc(firebaseUser.uid), { photoURL: url });
                    toast.success("Profile photo updated.");
                    setPhotoFile(null);
                  } catch (err) {
                    toast.error(getFirebaseErrorMessage(err));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Camera className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile" className="gap-2">
            <CircleUser className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Mail className="h-4 w-4" /> Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic info</CardTitle>
              <CardDescription>Stored in Firestore and used in the UI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                className="grid gap-4"
                onSubmit={profileForm.handleSubmit(async (values) => {
                  setBusy(true);
                  try {
                    await updateProfile(firebaseUser, { displayName: values.displayName });
                    await updateDoc(userDoc(firebaseUser.uid), {
                      displayName: values.displayName,
                      profile: {
                        phone: values.phone?.trim() || "",
                        addressLine1: values.addressLine1?.trim() || "",
                        addressLine2: values.addressLine2?.trim() || "",
                        city: values.city?.trim() || "",
                        country: values.country?.trim() || "",
                        postalCode: values.postalCode?.trim() || "",
                        notes: values.notes?.trim() || "",
                      },
                    });
                    toast.success("Profile updated.");
                  } catch (err) {
                    toast.error(getFirebaseErrorMessage(err));
                  } finally {
                    setBusy(false);
                  }
                })}
              >
                <div className="grid gap-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input id="displayName" {...profileForm.register("displayName")} />
                  {profileForm.formState.errors.displayName ? (
                    <p className="text-xs text-destructive">
                      {profileForm.formState.errors.displayName.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input id="phone" placeholder="+880…" {...profileForm.register("phone")} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="Bangladesh" {...profileForm.register("country")} />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="addressLine1" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Shipping address
                  </Label>
                  <Input
                    id="addressLine1"
                    placeholder="House / road / area"
                    {...profileForm.register("addressLine1")}
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="addressLine2"
                    placeholder="Apartment / floor (optional)"
                    {...profileForm.register("addressLine2")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Dhaka" {...profileForm.register("city")} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="postalCode">Postal code</Label>
                    <Input id="postalCode" placeholder="—" {...profileForm.register("postalCode")} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email (read-only)</Label>
                    <Input value={firebaseUser.email ?? ""} readOnly />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Delivery notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Gate code, preferred delivery time, instructions…"
                    {...profileForm.register("notes")}
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button type="submit" disabled={busy}>
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change email</CardTitle>
              <CardDescription>Updates your email address (requires re-auth).</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-[1fr_280px] sm:items-end">
              <div className="grid gap-2">
                <Label htmlFor="newEmail">New email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="new@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emailPassword">Current password</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  disabled={busy || !newEmail.trim() || !emailPassword}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const { changeEmail } = await import("@/lib/auth-account");
                      await changeEmail({
                        user: firebaseUser,
                        newEmail: newEmail.trim(),
                        currentPassword: emailPassword,
                      });
                      toast.success("Email updated.");
                      setNewEmail("");
                      setEmailPassword("");
                    } catch (err) {
                      toast.error(getFirebaseErrorMessage(err));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Update email
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Requires your current password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4"
                onSubmit={passwordForm.handleSubmit(async ({ currentPassword, newPassword }) => {
                  setBusy(true);
                  try {
                    await reauthWithPassword(firebaseUser, currentPassword);
                    await updatePassword(firebaseUser, newPassword);
                    toast.success("Password updated.");
                    passwordForm.reset({ currentPassword: "", newPassword: "" });
                  } catch (err) {
                    toast.error(getFirebaseErrorMessage(err));
                  } finally {
                    setBusy(false);
                  }
                })}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword2">Current password</Label>
                    <Input
                      id="currentPassword2"
                      type="password"
                      {...passwordForm.register("currentPassword")}
                    />
                    {passwordForm.formState.errors.currentPassword ? (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
                    {passwordForm.formState.errors.newPassword ? (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={busy}>
                    <KeyRound className="h-4 w-4" />
                    Update password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Danger zone
              </CardTitle>
              <CardDescription>Delete your account. This cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Deletes your Firebase Auth user. Your order history may remain for audit.
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete account</DialogTitle>
                    <DialogDescription>
                      Type <span className="font-mono">DELETE</span> and enter your current password to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="deleteConfirm">Confirm</Label>
                      <Input
                        id="deleteConfirm"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deletePassword">Current password</Label>
                      <Input
                        id="deletePassword"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      disabled={busy || deleteConfirm !== "DELETE" || !deletePassword}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await reauthWithPassword(firebaseUser, deletePassword);
                          await deleteUser(firebaseUser);
                          toast.success("Account deleted.");
                        } catch (err) {
                          toast.error(getFirebaseErrorMessage(err));
                        } finally {
                          setBusy(false);
                          setDeleteConfirm("");
                          setDeletePassword("");
                        }
                      }}
                    >
                      Permanently delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emails</CardTitle>
              <CardDescription>Manage what we can send you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                className="grid gap-4"
                onSubmit={prefsForm.handleSubmit(async (values) => {
                  setBusy(true);
                  try {
                    await updateDoc(userDoc(firebaseUser.uid), { prefs: values });
                    toast.success("Preferences saved.");
                  } catch (err) {
                    toast.error(getFirebaseErrorMessage(err));
                  } finally {
                    setBusy(false);
                  }
                })}
              >
                <label className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Marketing emails</div>
                    <div className="text-sm text-muted-foreground">
                      Product updates, new arrivals, and deals.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={prefsForm.watch("marketingEmail")}
                    onChange={(e) => prefsForm.setValue("marketingEmail", e.target.checked, { shouldDirty: true })}
                  />
                </label>

                <div className="flex justify-end">
                  <Button type="submit" disabled={busy}>
                    Save preferences
                  </Button>
                </div>
              </form>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
