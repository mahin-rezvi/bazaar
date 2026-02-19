"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/format";
import { getFirebaseErrorMessage } from "@/lib/auth";

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = React.useState(0);
  const imagesKey = React.useMemo(() => images.join("|"), [images]);
  React.useEffect(() => setActive(0), [imagesKey]);
  const main = images[active] ?? images[0] ?? null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted">
        {main ? (
          <Image
            src={main}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-auto pb-1">
          {images.slice(0, 6).map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border ${
                idx === active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              }`}
              onClick={() => setActive(idx)}
              aria-label={`Select image ${idx + 1}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const cart = useCart();
  const productQuery = useProduct(id);
  const product = productQuery.data;
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => setQty(1), [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Product</h1>
          <p className="text-sm text-muted-foreground">
            {product ? product.category : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/products">Back</Link>
          </Button>
        </div>
      </div>

      {productQuery.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      ) : !product ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {productQuery.isError
              ? getFirebaseErrorMessage(productQuery.error)
              : "Product not found."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Gallery images={product.images ?? []} title={product.title} />
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{product.title}</h2>
              <div className="mt-2 text-2xl font-semibold">
                {formatCurrency(product.price)}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>Stock: {product.stock}</span>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4" /> {product.ratingAvg.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-foreground prose-p:text-muted-foreground">
              <p>{product.description || "No description provided."}</p>
            </div>

            {product.highlights?.length ? (
              <div className="grid gap-2">
                <div className="text-sm font-semibold">Highlights</div>
                <ul className="grid gap-1 text-sm text-muted-foreground">
                  {product.highlights.slice(0, 6).map((h, idx) => (
                    <li key={`${h}-${idx}`} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Decrease quantity"
                onClick={() => setQty((n) => Math.max(1, n - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-12 text-center text-sm font-semibold">{qty}</div>
              <Button
                variant="outline"
                size="icon"
                aria-label="Increase quantity"
                onClick={() => setQty((n) => Math.min(99, n + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <motion.div whileTap={{ scale: 0.99 }}>
              <Button
                className="w-full"
                onClick={async () => {
                  if (!profile) {
                    toast.message("Sign in to use your cart.");
                    router.push(`/login?next=${encodeURIComponent(`/product/${id}`)}`);
                    return;
                  }
                  await cart.addItem({
                    productId: id,
                    title: product.title,
                    image: product.images?.[0] ?? null,
                    price: product.price,
                    qty,
                  });
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to cart
              </Button>
            </motion.div>

            <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
              Checkout is mock-payment (architecture clean). Admin can manage products
              and orders.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
