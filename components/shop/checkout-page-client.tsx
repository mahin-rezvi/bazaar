"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-orders";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CheckoutPageClient() {
  const router = useRouter();
  const { cart } = useCart();
  const checkout = useCheckout();
  const items = cart?.items ?? [];
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const [receipt, setReceipt] = React.useState<{
    orderId: string;
    createdAt: Date;
    items: typeof items;
    total: number;
    fullName: string;
    address: string;
    city: string;
    phone: string;
  } | null>(null);

  const schema = z.object({
    fullName: z.string().min(2),
    address: z.string().min(6),
    city: z.string().min(2),
    phone: z.string().min(6),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", address: "", city: "", phone: "" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Mock payment (architecture clean) — orders persist to Firestore.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                if (!items.length) return;
                try {
                  const snapshot = {
                    items: items.map((i) => ({ ...i })),
                    total,
                  };
                  const id = await checkout.mutateAsync(values);
                  setReceipt({
                    orderId: id,
                    createdAt: new Date(),
                    items: snapshot.items,
                    total: snapshot.total,
                    fullName: values.fullName,
                    address: values.address,
                    city: values.city,
                    phone: values.phone,
                  });
                } catch {
                  // toast handled in hook
                }
              })}
            >
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" {...form.register("fullName")} />
                {form.formState.errors.fullName ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fullName.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...form.register("address")} />
                {form.formState.errors.address ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.address.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...form.register("city")} />
                  {form.formState.errors.city ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.city.message}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...form.register("phone")} />
                  {form.formState.errors.phone ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.phone.message}
                    </p>
                  ) : null}
                </div>
              </div>
              <Button type="submit" disabled={!items.length || checkout.isPending}>
                {checkout.isPending ? "Placing order…" : "Place order"}
              </Button>
              <p className="text-xs text-muted-foreground">
                This is a demo checkout: no real payment is processed.
              </p>
            </form>

            {receipt ? (
              <div className="mt-6 rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Invoice</div>
                    <div className="text-xs text-muted-foreground">Order #{receipt.orderId}</div>
                  </div>
                  <Button type="button" variant="outline" onClick={() => router.push("/orders")}>
                    View orders
                  </Button>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {receipt.createdAt.toLocaleString()}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {receipt.items.map((i) => (
                    <div key={i.productId} className="flex items-center justify-between">
                      <div className="min-w-0 truncate">
                        {i.title} <span className="text-muted-foreground">×{i.qty}</span>
                      </div>
                      <div className="font-medium">{formatCurrency(i.price * i.qty)}</div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-base font-semibold">{formatCurrency(receipt.total)}</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">{receipt.fullName}</div>
                  <div>{receipt.phone}</div>
                  <div>{receipt.address}</div>
                  <div>{receipt.city}</div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length ? (
              <div className="space-y-2">
                {items.map((i) => (
                  <div key={i.productId} className="flex items-center justify-between text-sm">
                    <div className="min-w-0 truncate">
                      {i.title} <span className="text-muted-foreground">×{i.qty}</span>
                    </div>
                    <div className="font-medium">{formatCurrency(i.price * i.qty)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Your cart is empty.</div>
            )}
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-base font-semibold">{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
