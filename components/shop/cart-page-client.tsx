"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/format";

export function CartPageClient() {
  const { cart, loading, updateQty, clear } = useCart();
  const items = cart?.items ?? [];
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
          <p className="text-sm text-muted-foreground">
            Your cart persists to Firestore.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => clear()} disabled={!items.length}>
            Clear
          </Button>
          <Button asChild disabled={!items.length}>
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      ) : !items.length ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-sm font-semibold">Your cart is empty</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Add something you like — we’ll keep it synced here.
            </div>
            <div className="mt-4 flex justify-center">
              <Button asChild>
                <Link href="/products">Browse products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-3 rounded-xl border bg-background p-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(item.price)} · Subtotal{" "}
                    {formatCurrency(item.price * item.qty)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Decrease quantity"
                    onClick={() => updateQty({ productId: item.productId, qty: item.qty - 1 })}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-10 text-center text-sm font-semibold">{item.qty}</div>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Increase quantity"
                    onClick={() => updateQty({ productId: item.productId, qty: item.qty + 1 })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove"
                    onClick={() => updateQty({ productId: item.productId, qty: 0 })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Card className="h-fit">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="text-base font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="mt-4 grid gap-2">
                <Button asChild>
                  <Link href="/checkout">Continue to checkout</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/products">Keep shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
