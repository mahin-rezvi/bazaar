import { Suspense } from "react";
import { ProductsPageClient } from "@/components/shop/products-page-client";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <ProductsPageClient />
    </Suspense>
  );
}
