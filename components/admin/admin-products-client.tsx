"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2, Upload } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CATEGORIES, type Category } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { productSchema } from "@/lib/validators";
import { createProduct, deleteProduct, updateProduct, type Product } from "@/lib/firestore/products";
import { uploadPublicImage } from "@/lib/firestore/storage";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useProductsInfinite } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ProductFormValues = z.infer<typeof productSchema>;

function toFormValues(p?: Product): ProductFormValues {
  return {
    title: p?.title ?? "",
    description: p?.description ?? "A well-crafted item designed for daily use.",
    highlights: p?.highlights ?? [],
    price: p?.price ?? 0,
    images: (p?.images ?? []).filter(Boolean),
    category: (p?.category as Category) ?? CATEGORIES[0],
    stock: p?.stock ?? 0,
    ratingAvg: p?.ratingAvg ?? 0,
  };
}

function ProductEditor({
  product,
  onDone,
}: {
  product?: Product;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: toFormValues(product),
  });
  const category = useWatch({ control: form.control, name: "category" });
  const images = useWatch({ control: form.control, name: "images" });
  const highlights = useWatch({ control: form.control, name: "highlights" });

  React.useEffect(() => form.reset(toFormValues(product)), [product, form]);

  const [file, setFile] = React.useState<File | null>(null);

  const createMut = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      return await createProduct({
        ...values,
        images: values.images ?? [],
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created.");
      onDone();
    },
    onError: () => toast.error("Couldn’t create product."),
  });

  const updateMut = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!product) throw new Error("Missing product");
      await updateProduct(product.id, values);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated.");
      onDone();
    },
    onError: () => toast.error("Couldn’t update product."),
  });

  async function uploadSelected() {
    if (!file) return;
    try {
      const url = await uploadPublicImage({
        file,
        path: `products/${Date.now()}-${file.name}`.replace(/\s+/g, "-"),
      });
      const current = form.getValues("images") ?? [];
      form.setValue("images", [url, ...current], { shouldDirty: true });
      toast.success("Image uploaded.");
      setFile(null);
    } catch {
      toast.error("Image upload failed.");
    }
  }

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        if (product) await updateMut.mutateAsync(values);
        else await createMut.mutateAsync(values);
      })}
    >
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} />
        {form.formState.errors.title ? (
          <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register("description")} />
        {form.formState.errors.description ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            inputMode="decimal"
            {...form.register("price", { valueAsNumber: true })}
          />
          {form.formState.errors.price ? (
            <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" inputMode="numeric" {...form.register("stock", { valueAsNumber: true })} />
          {form.formState.errors.stock ? (
            <p className="text-xs text-destructive">{form.formState.errors.stock.message}</p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={category}
            onChange={(e) =>
              form.setValue("category", e.target.value as ProductFormValues["category"], {
                shouldDirty: true,
              })
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {form.formState.errors.category ? (
            <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ratingAvg">Rating avg</Label>
          <Input
            id="ratingAvg"
            inputMode="decimal"
            {...form.register("ratingAvg", { valueAsNumber: true })}
          />
          {form.formState.errors.ratingAvg ? (
            <p className="text-xs text-destructive">{form.formState.errors.ratingAvg.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Images</Label>
        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="outline" onClick={uploadSelected} disabled={!file}>
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>
        <div className="grid gap-2">
          <Input
            placeholder="Or paste an image URL"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              const input = (e.currentTarget as HTMLInputElement).value.trim();
              if (!input) return;
              const current = form.getValues("images") ?? [];
              form.setValue("images", [input, ...current], { shouldDirty: true });
              (e.currentTarget as HTMLInputElement).value = "";
            }}
          />
          <div className="space-y-1">
            {(images ?? []).slice(0, 5).map((url) => (
              <div key={url} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-xs">
                <span className="truncate">{url}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    form.setValue(
                      "images",
                      (form.getValues("images") ?? []).filter((u) => u !== url),
                      { shouldDirty: true },
                    );
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Highlights</Label>
        <Input
          placeholder="Type a highlight and press Enter"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            const input = (e.currentTarget as HTMLInputElement).value.trim();
            if (!input) return;
            const current = form.getValues("highlights") ?? [];
            form.setValue("highlights", [...current, input].slice(0, 8), { shouldDirty: true });
            (e.currentTarget as HTMLInputElement).value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          {(highlights ?? []).map((h, idx) => (
            <button
              type="button"
              key={`${h}-${idx}`}
              className="rounded-full border bg-muted/30 px-2.5 py-1 text-xs hover:bg-muted"
              onClick={() => {
                form.setValue(
                  "highlights",
                  (form.getValues("highlights") ?? []).filter((_, i) => i !== idx),
                  { shouldDirty: true },
                );
              }}
              aria-label={`Remove highlight: ${h}`}
              title="Click to remove"
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : product ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

export function AdminProductsClient() {
  const [q, setQ] = React.useState("");
  const qDebounced = useDebouncedValue(q, 300);
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useProductsInfinite({
      q: qDebounced || undefined,
      sort: "newest",
      pageSize: 25,
    });

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const qc = useQueryClient();

  const delMut = useMutation({
    mutationFn: async (id: string) => deleteProduct(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted.");
    },
    onError: () => toast.error("Couldn’t delete product."),
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | undefined>(undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Admin-only catalog CRUD.</p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            placeholder="Search title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="sm:w-72"
          />
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditing(undefined);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
              </DialogHeader>
              <ProductEditor
                product={editing}
                onDone={() => {
                  setOpen(false);
                  setEditing(undefined);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-sm text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : items.length ? (
            items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-[360px] truncate font-medium">{p.title}</TableCell>
                <TableCell className="text-muted-foreground">{p.category}</TableCell>
                <TableCell className="text-right">{formatCurrency(p.price)}</TableCell>
                <TableCell className="text-right">{p.stock}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                      aria-label="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        if (!confirm("Delete this product?")) return;
                        delMut.mutate(p.id);
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-sm text-muted-foreground">
                No products.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center">
        {hasNextPage ? (
          <Button
            variant="outline"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
