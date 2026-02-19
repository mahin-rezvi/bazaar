import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
} from "firebase/firestore";

import { cartDoc, cartsCol, productDoc, type CartDoc, type CartItem } from "@/lib/db";
import { getFirebaseClient } from "@/lib/firebase";

export type Cart = CartDoc & { uid: string };

export async function getCart(uid: string): Promise<Cart> {
  const snap = await getDoc(cartDoc(uid));
  if (!snap.exists()) {
    return { uid, items: [] };
  }
  return { uid, ...(snap.data() as CartDoc) };
}

export function subscribeCart(
  uid: string,
  onData: (cart: Cart) => void,
  onError: (err: unknown) => void,
) {
  return onSnapshot(
    cartDoc(uid),
    (snap) => {
      if (!snap.exists()) onData({ uid, items: [] });
      else onData({ uid, ...(snap.data() as CartDoc) });
    },
    onError,
  );
}

export async function addToCart(uid: string, item: CartItem) {
  const { db } = getFirebaseClient();
  const cartRef = doc(cartsCol(), uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(cartRef);
    const current: CartDoc = snap.exists() ? (snap.data() as CartDoc) : { items: [] };
    const existing = current.items.find((i) => i.productId === item.productId);
    const nextItems = existing
      ? current.items.map((i) =>
          i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i,
        )
      : [...current.items, item];
    tx.set(cartRef, { items: nextItems }, { merge: true });
  });
}

export async function updateCartQty(uid: string, productId: string, qty: number) {
  const { db } = getFirebaseClient();
  const cartRef = doc(cartsCol(), uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(cartRef);
    const current: CartDoc = snap.exists() ? (snap.data() as CartDoc) : { items: [] };
    const nextItems =
      qty <= 0
        ? current.items.filter((i) => i.productId !== productId)
        : current.items.map((i) => (i.productId === productId ? { ...i, qty } : i));
    tx.set(cartRef, { items: nextItems }, { merge: true });
  });
}

export async function clearCart(uid: string) {
  await setDoc(cartDoc(uid), { items: [] }, { merge: true });
}

export async function cartItemFromProduct({
  productId,
}: {
  productId: string;
}): Promise<CartItem | null> {
  const snap = await getDoc(productDoc(productId));
  if (!snap.exists()) return null;
  const p = snap.data();
  return {
    productId,
    title: p.title,
    image: p.images?.[0] ?? null,
    price: p.price,
    qty: 1,
  };
}
