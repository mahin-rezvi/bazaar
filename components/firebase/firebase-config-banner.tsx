"use client";

import * as React from "react";

import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FirebaseConfigBanner() {
  const { configError } = useAuth();
  if (!configError) return null;

  return (
    <div className="mb-4">
      <Alert className="border-destructive/40">
        <AlertTitle>Firebase not configured</AlertTitle>
        <AlertDescription>
          <pre className="whitespace-pre-wrap text-xs leading-5">{configError}</pre>
        </AlertDescription>
      </Alert>
    </div>
  );
}

