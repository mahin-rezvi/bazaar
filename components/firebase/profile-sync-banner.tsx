"use client";

import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ProfileSyncBanner() {
  const { firebaseUser, profile, profileError } = useAuth();

  if (!firebaseUser || profile || !profileError) return null;

  return (
    <div className="border-b bg-background/80">
      <div className="mx-auto w-full max-w-6xl px-4 py-2 text-sm sm:px-6 lg:px-8">
        <Alert className="border-destructive/40">
          <AlertTitle>Account setup incomplete</AlertTitle>
          <AlertDescription>
            {profileError}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

