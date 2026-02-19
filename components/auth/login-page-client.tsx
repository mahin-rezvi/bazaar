"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck, Sparkles, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { getFirebaseErrorMessage, signInWithEmail, signInWithGoogle } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, firebaseUser, configError } = useAuth();

  const next = searchParams.get("next") || "/products";

  const form = useForm<{ email: string; password: string }>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  React.useEffect(() => {
    if (profile || firebaseUser) router.replace(next);
  }, [profile, firebaseUser, router, next]);

  const [busy, setBusy] = React.useState(false);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-16 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />

      <Card className="relative overflow-hidden border border-border/60 bg-background/70 shadow-xl backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-emerald-400/15" />
        <CardHeader className="relative space-y-4">
          <Badge variant="muted" className="w-fit gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure access
          </Badge>
          <div className="space-y-1">
            <CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
            <CardDescription>Sign in to continue to Hudai.</CardDescription>
          </div>
          <div className="grid gap-2 rounded-xl border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Fast checkout with saved details
            </div>
            <div className="flex items-center gap-2">
              <Wand2 className="h-3.5 w-3.5 text-emerald-500" />
              New arrivals curated daily
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative grid gap-5">
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(async ({ email, password }) => {
              if (configError) {
                toast.error("Firebase is not configured. Add .env.local and restart.");
                return;
              }
              setBusy(true);
              try {
                const user = await signInWithEmail({ email, password });
                toast.success("Signed in.");
                router.replace(next);
              } catch {
                toast.error("Invalid email or password.");
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
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/reset"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={busy} className="shadow-lg shadow-primary/20">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-background/80 px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={async () => {
              if (configError) {
                toast.error("Firebase is not configured. Add .env.local and restart.");
                return;
              }
              setBusy(true);
              try {
                const user = await signInWithGoogle();
                if (user) {
                  toast.success("Signed in with Google.");
                  router.replace(next);
                } else {
                  // Redirect flow initiated (popup blocked / unsupported).
                  toast.message("Redirecting to Google…");
                }
              } catch (err) {
                toast.error(getFirebaseErrorMessage(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link className="text-foreground underline underline-offset-4" href="/register">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
