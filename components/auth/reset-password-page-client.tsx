"use client";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendResetPasswordEmail } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";

export function ResetPasswordPageClient() {
  const [busy, setBusy] = React.useState(false);
  const form = useForm<{ email: string }>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          We’ll email you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(async ({ email }) => {
            setBusy(true);
            try {
              await sendResetPasswordEmail(email);
              toast.success("Reset email sent.");
            } catch {
              toast.error("Couldn’t send reset email.");
            } finally {
              setBusy(false);
            }
          })}
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link className="text-foreground underline underline-offset-4" href="/login">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
