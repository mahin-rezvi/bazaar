"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { DocumentSnapshot } from "firebase/firestore";

import type { Category } from "@/lib/constants";
import type { ProductDoc } from "@/lib/db";
import { getProductById, listProductsPage, type ProductSort } from "@/lib/firestore/products";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });
}

export function useProductsInfinite({
  q,
  category,
  sort,
  pageSize = 12,
}: {
  q?: string;
  category?: Category;
  sort?: ProductSort;
  pageSize?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["products", { q: q ?? "", category: category ?? "", sort: sort ?? "newest" }],
    initialPageParam: null as DocumentSnapshot<ProductDoc> | null,
    queryFn: async ({ pageParam }) =>
      listProductsPage({
        q,
        category,
        sort,
        pageSize,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

