"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import type { Product } from "@/lib/firestore/products";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { profile } = useAuth();
  const cart = useCart();
  const img = product.images?.[0] ?? null;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-muted">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
        )}
      </div>
      <CardContent className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.id}`} className="min-w-0">
            <div className="line-clamp-2 text-sm font-semibold leading-5">
              {product.title}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="muted">{product.category}</Badge>
              <span className="text-xs text-muted-foreground">
                Stock: {product.stock}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5" />
                {product.ratingAvg.toFixed(1)}
              </span>
            </div>
          </Link>
          <div className="text-sm font-semibold">{formatCurrency(product.price)}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/product/${product.id}`}>Details</Link>
          </Button>
          <motion.div whileTap={{ scale: 0.98 }} className="shrink-0">
            <Button
              size="icon"
              aria-label="Add to cart"
              onClick={async () => {
                if (!profile) {
                  toast.message("Sign in to use your cart.", {
                    description: "Your cart syncs across devices.",
                  });
                  router.push(`/login?next=${encodeURIComponent("/products")}`);
                  return;
                }
                await cart.addProduct(product.id);
              }}
              className={cn(!profile && "opacity-80")}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
