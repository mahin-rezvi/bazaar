"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PackageCheck } from "lucide-react";
import { Timestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/use-orders";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function OrdersPageClient() {
  const orders = useOrders();
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            View your order history and status updates.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/products">Keep shopping</Link>
        </Button>
      </div>
      {orders.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !orders.data?.length ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-sm font-semibold">No orders yet</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Place an order from checkout and it’ll show up here.
            </div>
            <div className="mt-4 flex justify-center">
              <Button asChild>
                <Link href="/products">Browse products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.data.map((o) => {
            const createdAt =
              o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date();
            return (
              <Card
                key={o.id}
                className={cn(
                  "transition",
                  highlight === o.id && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-muted-foreground" />
                      <div className="truncate text-sm font-semibold">Order {o.id}</div>
                      <Badge variant="secondary">{o.status}</Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {o.items.length} item(s) · {formatDate(createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-sm font-semibold">{formatCurrency(o.total)}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
