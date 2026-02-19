import {
  DocumentSnapshot,
  QueryConstraint,
  addDoc,
  deleteDoc,
  endAt,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  startAt,
  updateDoc,
  where,
} from "firebase/firestore";

import { productDoc, productsCol, type ProductDoc } from "@/lib/db";
import type { Category } from "@/lib/constants";

export type Product = ProductDoc & { id: string };

export type ProductSort = "newest" | "price_asc" | "price_desc";

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(productDoc(id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as ProductDoc) };
}

export async function listProductsPage({
  q,
  category,
  sort = "newest",
  pageSize = 12,
  cursor,
}: {
  q?: string;
  category?: Category;
  sort?: ProductSort;
  pageSize?: number;
  cursor?: DocumentSnapshot<ProductDoc> | null;
}): Promise<{ items: Product[]; nextCursor: DocumentSnapshot<ProductDoc> | null }> {
  const constraints: QueryConstraint[] = [];

  if (category) constraints.push(where("category", "==", category));

  const term = q?.trim().toLowerCase();
  if (term) {
    constraints.push(orderBy("titleLower", "asc"));
    constraints.push(startAt(term));
    constraints.push(endAt(term + "\uf8ff"));
  } else {
    if (sort === "newest") constraints.push(orderBy("createdAt", "desc"));
    if (sort === "price_asc") constraints.push(orderBy("price", "asc"));
    if (sort === "price_desc") constraints.push(orderBy("price", "desc"));
  }

  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(pageSize));

  const qref = query(productsCol(), ...constraints);
  const snap = await getDocs(qref);
  const docs = snap.docs as DocumentSnapshot<ProductDoc>[];

  return {
    items: docs.map((d) => ({ id: d.id, ...(d.data() as ProductDoc) })),
    nextCursor: docs.length ? docs[docs.length - 1] : null,
  };
}

export async function createProduct(
  input: Omit<ProductDoc, "createdAt" | "updatedAt" | "titleLower">,
) {
  const ref = await addDoc(productsCol(), {
    ...input,
    titleLower: input.title.toLowerCase(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(
  id: string,
  input: Partial<Omit<ProductDoc, "createdAt" | "updatedAt" | "titleLower">>,
) {
  await updateDoc(productDoc(id), {
    ...input,
    ...(input.title ? { titleLower: input.title.toLowerCase() } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string) {
  await deleteDoc(productDoc(id));
}
