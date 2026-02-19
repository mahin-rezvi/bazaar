"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { listUserOrders, placeOrder } from "@/lib/firestore/orders";

export function useOrders() {
  const { profile } = useAuth();
  const uid = profile?.uid;

  return useQuery({
    enabled: Boolean(uid),
    queryKey: ["orders", uid],
    queryFn: () => listUserOrders(uid!),
  });
}

export function useCheckout() {
  const { profile, firebaseUser } = useAuth();
  const uid = profile?.uid;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { fullName: string; address: string; city: string; phone: string }) => {
      if (!uid || !firebaseUser) throw new Error("Not signed in");
      return await placeOrder(uid, {
        ...payload,
        email: firebaseUser.email ?? null,
      });
    },
    onSuccess: async (orderId) => {
      await qc.invalidateQueries({ queryKey: ["orders", uid] });
      await qc.invalidateQueries({ queryKey: ["cart", uid] });
      toast.success("Order placed.", { description: `Order: ${orderId}` });
    },
    onError: () => toast.error("Couldn’t place order."),
  });
}
