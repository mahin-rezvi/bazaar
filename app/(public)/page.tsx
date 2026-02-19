import Link from "next/link";
import { ArrowRight, BadgeCheck, Boxes, ShieldCheck, Sparkles, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-muted/60 via-background to-background p-8 shadow-soft sm:p-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Built for fun
          </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Hudai — a modern marketplace experience
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Browse curated products, manage your cart across devices, and keep
            orders organized — with secure, role-based admin workflows.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/products">
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
              <Button variant="ghost" asChild>
                <Link href="/contact">Contact</Link>
              </Button>
          </div>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background/60 p-4 backdrop-blur">
                <div className="text-sm font-semibold">Secure rules</div>
                <div className="text-xs text-muted-foreground">RBAC enforced in Firestore</div>
              </div>
              <div className="rounded-2xl border bg-background/60 p-4 backdrop-blur">
                <div className="text-sm font-semibold">Fast search</div>
                <div className="text-xs text-muted-foreground">Debounced + cached queries</div>
              </div>
              <div className="rounded-2xl border bg-background/60 p-4 backdrop-blur">
                <div className="text-sm font-semibold">Mobile first</div>
                <div className="text-xs text-muted-foreground">Sheets + drawers + skeletons</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="bg-background/70 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BadgeCheck className="h-5 w-5" /> Secure auth
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Email/password + Google sign-in, with password reset.
                </CardContent>
              </Card>
              <Card className="bg-background/70 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Boxes className="h-5 w-5" /> Admin workflows
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Product CRUD, orders status management, user overview.
                </CardContent>
              </Card>
            </div>
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" /> Marketplace UX
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sticky search, mobile filter drawer, skeletons, and polished
            layouts.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Secure by design
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Firebase Auth for identity, Firestore rules for authorization.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Smooth interactions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Lightweight animations and responsive components throughout.
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl border bg-muted/20 p-8 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Built by</h2>
            <p className="text-sm text-muted-foreground">
              {SITE.owner.fullName} · {SITE.owner.title} · {SITE.owner.organization}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button asChild variant="outline">
              <Link href="/contact">Contact</Link>
            </Button>
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
