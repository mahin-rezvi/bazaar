"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Sparkles, Star, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { getFirebaseErrorMessage, signUpWithEmail } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export function RegisterPageClient() {
  const router = useRouter();
  const { profile, firebaseUser, configError } = useAuth();

  const form = useForm<{ displayName: string; email: string; password: string }>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", email: "", password: "" },
  });

  React.useEffect(() => {
    if (profile || firebaseUser) router.replace("/products");
  }, [profile, firebaseUser, router]);

  const [busy, setBusy] = React.useState(false);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />

      <Card className="relative overflow-hidden border border-border/60 bg-background/70 shadow-xl backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-emerald-400/15" />
        <CardHeader className="relative space-y-4">
          <Badge variant="muted" className="w-fit gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Get started
          </Badge>
          <div className="space-y-1">
            <CardTitle className="text-2xl tracking-tight">Create your account</CardTitle>
            <CardDescription>Start shopping with a single login.</CardDescription>
          </div>
          <div className="grid gap-2 rounded-xl border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-primary" />
              Member-only deals and drops
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-emerald-500" />
              Faster checkout and tracking
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative grid gap-5">
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(async ({ displayName, email, password }) => {
              if (configError) {
                toast.error("Firebase is not configured. Add .env.local and restart.");
                return;
              }
              setBusy(true);
              try {
                await signUpWithEmail({ displayName, email, password });
                toast.success("Account created.");
                router.replace("/products");
              } catch (err) {
                toast.error(getFirebaseErrorMessage(err));
              } finally {
                setBusy(false);
              }
            })}
          >
            <div className="grid gap-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" placeholder="Jane Doe" {...form.register("displayName")} />
              {form.formState.errors.displayName ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.displayName.message}
                </p>
              ) : null}
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={busy} className="shadow-lg shadow-primary/20">
              {busy ? "Creating…" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-foreground underline underline-offset-4" href="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
