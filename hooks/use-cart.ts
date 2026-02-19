"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import type { CartItem } from "@/lib/db";
import { addToCart, cartItemFromProduct, clearCart, getCart, subscribeCart, updateCartQty } from "@/lib/firestore/cart";

export function useCart() {
  const { profile } = useAuth();
  const uid = profile?.uid;
  const queryClient = useQueryClient();

  const query = useQuery({
    enabled: Boolean(uid),
    queryKey: ["cart", uid],
    queryFn: () => getCart(uid!),
    staleTime: Infinity,
  });

  React.useEffect(() => {
    if (!uid) return;
    const unsub = subscribeCart(
      uid,
      (cart) => queryClient.setQueryData(["cart", uid], cart),
      () => {},
    );
    return unsub;
  }, [uid, queryClient]);

  const addMutation = useMutation({
    mutationFn: async (item: CartItem) => {
      if (!uid) throw new Error("Not signed in");
      await addToCart(uid, item);
    },
    onSuccess: () => toast.success("Added to cart."),
    onError: () => toast.error("Couldn’t add to cart."),
  });

  const addProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!uid) throw new Error("Not signed in");
      const item = await cartItemFromProduct({ productId });
      if (!item) throw new Error("Missing product");
      await addToCart(uid, item);
    },
    onSuccess: () => toast.success("Added to cart."),
    onError: () => toast.error("Couldn’t add to cart."),
  });

  const updateQtyMutation = useMutation({
    mutationFn: async ({ productId, qty }: { productId: string; qty: number }) => {
      if (!uid) throw new Error("Not signed in");
      await updateCartQty(uid, productId, qty);
    },
    onError: () => toast.error("Couldn’t update cart."),
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!uid) throw new Error("Not signed in");
      await clearCart(uid);
    },
    onSuccess: () => toast.success("Cart cleared."),
    onError: () => toast.error("Couldn’t clear cart."),
  });

  return {
    uid,
    cart: query.data,
    loading: query.isLoading,
    addItem: addMutation.mutateAsync,
    addProduct: addProductMutation.mutateAsync,
    updateQty: updateQtyMutation.mutateAsync,
    clear: clearMutation.mutateAsync,
  };
}

