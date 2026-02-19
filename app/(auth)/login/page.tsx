import { Suspense } from "react";
import { LoginPageClient } from "@/components/auth/login-page-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
