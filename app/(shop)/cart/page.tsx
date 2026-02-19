import { CartPageClient } from "@/components/shop/cart-page-client";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function CartPage() {
  return (
    <AuthGuard>
      <CartPageClient />
    </AuthGuard>
  );
}
