"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { ShoppingBag, SlidersHorizontal } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { AccountMenu } from "@/components/auth/account-menu";
import { ProfileSyncBanner } from "@/components/firebase/profile-sync-banner";

function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [q, setQ] = React.useState(initial);

  React.useEffect(() => setQ(initial), [initial]);

  return (
    <form
      className="hidden w-full max-w-md sm:block"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (q.trim()) params.set("q", q.trim());
        else params.delete("q");
        const target = "/products";
        const qs = params.toString();
        router.push(qs ? `${target}?${qs}` : target);
      }}
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
      />
    </form>
  );
}

export function SiteHeader() {
  const { profile, firebaseUser } = useAuth();
  return (
    <header className="sticky top-0 z-40">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            HUDAI
          </Link>

          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            <Link href="/orders" className="hover:text-foreground">
              Orders
            </Link>
            <Link href="/account" className="hover:text-foreground">
              Profile
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
            {profile?.role === "admin" ? (
              <Link href="/admin/dashboard" className="hover:text-foreground">
                Admin
              </Link>
            ) : null}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <React.Suspense
              fallback={<div className="hidden h-10 w-full max-w-md sm:block" />}
            >
              <SearchBox />
            </React.Suspense>
            <Button variant="outline" size="icon" asChild>
              <Link href="/cart" aria-label="Cart">
                <ShoppingBag className="h-4 w-4" />
              </Link>
            </Button>
            <ThemeToggle />
            <AccountMenu />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Open menu">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle>Quick actions</SheetTitle>
                </SheetHeader>
                <div className="mt-6 grid gap-2 text-sm">
                  <Link href="/products" className="rounded-md px-2 py-2 hover:bg-muted">
                    Browse products
                  </Link>
                  <Link href="/cart" className="rounded-md px-2 py-2 hover:bg-muted">
                    Cart
                  </Link>
                  <Link href="/orders" className="rounded-md px-2 py-2 hover:bg-muted">
                    Orders
                  </Link>
                  <Link href="/account" className="rounded-md px-2 py-2 hover:bg-muted">
                    Profile
                  </Link>
                  <Link href="/contact" className="rounded-md px-2 py-2 hover:bg-muted">
                    Contact
                  </Link>
                  <Link
                    href={profile || firebaseUser ? "/orders" : "/login"}
                    className="rounded-md px-2 py-2 hover:bg-muted"
                  >
                    {profile || firebaseUser ? "Account" : "Sign in"}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <ProfileSyncBanner />
    </header>
  );
}
