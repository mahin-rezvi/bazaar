import { Suspense } from "react";
import { OrdersPageClient } from "@/components/shop/orders-page-client";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function OrdersPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <OrdersPageClient />
      </Suspense>
    </AuthGuard>
  );
}
