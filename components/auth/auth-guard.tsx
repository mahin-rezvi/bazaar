"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, profile } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-4">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!profile) {
    const next = encodeURIComponent(pathname);
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Please sign in to continue.
            </p>
            <Button asChild>
              <Link href={`/login?next=${next}`}>Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
