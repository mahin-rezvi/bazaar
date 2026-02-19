"use client";

import Link from "next/link";
import { LogOut, Settings, Shield, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export function AccountMenu() {
  const { profile, firebaseUser, profileError, signOut } = useAuth();

  if (!profile && !firebaseUser) {
    return (
      <Button asChild variant="outline" className="hidden sm:inline-flex">
        <Link href="/login">Sign in</Link>
      </Button>
    );
  }

  const label =
    profile?.displayName ||
    profile?.email ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    "Account";
  const photoURL = profile?.photoURL || firebaseUser?.photoURL || null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden gap-2 sm:inline-flex">
          <Avatar src={photoURL} alt="Account" fallback={initials(label)} className="h-6 w-6" />
          <span className="max-w-[140px] truncate text-sm">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <div className="truncate text-xs font-semibold text-foreground">{label}</div>
          <div className="text-xs font-normal text-muted-foreground">
            {profile?.role ?? "signed-in"}
          </div>
          {profileError ? (
            <div className="mt-1 text-xs font-normal text-destructive">
              Profile sync blocked (Firestore).
            </div>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profile ? (
          <DropdownMenuItem asChild>
            <Link href="/orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Orders
            </Link>
          </DropdownMenuItem>
        ) : null}
        {profile?.role === "admin" ? (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Profile settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async (e) => {
            e.preventDefault();
            try {
              await signOut();
              toast.success("Signed out.");
            } catch {
              toast.error("Couldn’t sign out.");
            }
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
