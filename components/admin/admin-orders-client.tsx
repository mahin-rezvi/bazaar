"use client";

import * as React from "react";
import type { DocumentSnapshot } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { listOrdersPage } from "@/lib/firestore/admin";
import { setOrderStatus } from "@/lib/firestore/orders";
import type { OrderDoc } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AdminOrdersClient() {
  const qc = useQueryClient();

  const q = useInfiniteQuery({
    queryKey: ["admin-orders"],
    initialPageParam: null as DocumentSnapshot<OrderDoc> | null,
    queryFn: ({ pageParam }) => listOrdersPage({ cursor: pageParam, pageSize: 25 }),
    getNextPageParam: (last) => last.nextCursor,
  });

  const items = q.data?.pages.flatMap((p) => p.items) ?? [];

  const mut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) =>
      setOrderStatus(id, status),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order updated.");
    },
    onError: () => toast.error("Couldn’t update order."),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Admin can read all orders and update status.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {q.isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-sm text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : items.length ? (
            items.map((o) => {
              const createdAt =
                o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date();
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell className="max-w-[220px]">
                    <div className="truncate text-sm">{o.customer?.name ?? "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {o.customer?.phone ?? o.customer?.email ?? o.userId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={o.status}
                      onChange={(e) =>
                        mut.mutate({ id: o.id, status: e.target.value as OrderStatus })
                      }
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(o.total)}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                    {o.shipping?.address ? `${o.shipping.address}, ${o.shipping.city ?? ""}` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(createdAt)}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-sm text-muted-foreground">
                No orders.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center">
        {q.hasNextPage ? (
          <Button
            variant="outline"
            disabled={q.isFetchingNextPage}
            onClick={() => q.fetchNextPage()}
          >
            {q.isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
