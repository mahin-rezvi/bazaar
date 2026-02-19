"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";

import { CATEGORIES, type Category } from "@/lib/constants";
import type { ProductSort } from "@/lib/firestore/products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useProductsInfinite } from "@/hooks/use-products";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getFirebaseErrorMessage } from "@/lib/auth";

export function ProductsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const categoryParam = (searchParams.get("category") ?? "") as Category | "";
  const sortParam = (searchParams.get("sort") ?? "newest") as ProductSort;

  const [q, setQ] = React.useState(qParam);
  React.useEffect(() => setQ(qParam), [qParam]);
  const qDebounced = useDebouncedValue(q, 350);

  React.useEffect(() => {
    if (qDebounced === qParam) return;
    const params = new URLSearchParams(searchParams.toString());
    if (qDebounced.trim()) params.set("q", qDebounced.trim());
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products");
  }, [qDebounced, qParam, router, searchParams]);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage, isError, error, refetch } =
    useProductsInfinite({
      q: qParam || undefined,
      category: categoryParam || undefined,
      sort: sortParam,
      pageSize: 12,
    });

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  function setParam(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products");
  }

  const Filters = (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <div className="text-xs font-semibold text-muted-foreground">Category</div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={!categoryParam ? "default" : "outline"}
            onClick={() => setParam("category", undefined)}
          >
            All
          </Button>
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={categoryParam === c ? "default" : "outline"}
              onClick={() => setParam("category", c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <div className="text-xs font-semibold text-muted-foreground">Sort</div>
        <select
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          value={sortParam}
          onChange={(e) => setParam("sort", e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and discover what’s new.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search products…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="sm:hidden" aria-label="Filters">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">{Filters}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-xl border bg-background p-4 lg:block">
          {Filters}
        </aside>
        <section className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className="space-y-3 rounded-xl border p-4">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border bg-background p-8">
              <div className="text-sm font-semibold">Couldn’t load products</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {getFirebaseErrorMessage(error)}
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            </div>
          ) : items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-background p-8 text-center">
              <div className="text-sm font-semibold">No results</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Try a different search or clear filters.
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" onClick={() => setParam("q", undefined)}>
                  Clear search
                </Button>
                <Button variant="outline" onClick={() => setParam("category", undefined)}>
                  Clear category
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            {hasNextPage ? (
              <Button
                variant="outline"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            ) : items.length ? (
              <div className="text-sm text-muted-foreground">You’re all caught up.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
