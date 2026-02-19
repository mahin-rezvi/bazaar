import {
  addDoc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { cartDoc, orderDoc, ordersCol, type CartDoc, type OrderDoc } from "@/lib/db";
import { getFirebaseClient } from "@/lib/firebase";
import type { OrderStatus } from "@/lib/constants";

export type Order = OrderDoc & { id: string };

export async function placeOrder(
  uid: string,
  details: {
    fullName: string;
    address: string;
    city: string;
    phone: string;
    email: string | null;
  },
): Promise<string> {
  getFirebaseClient();
  const cartSnap = await getDoc(cartDoc(uid));
  const cart = cartSnap.exists() ? (cartSnap.data() as CartDoc) : { items: [] };
  const total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const ref = await addDoc(ordersCol(), {
    userId: uid,
    items: cart.items,
    total,
    status: "pending",
    customer: {
      name: details.fullName,
      email: details.email,
      phone: details.phone,
    },
    shipping: {
      address: details.address,
      city: details.city,
    },
    createdAt: serverTimestamp(),
  });

  await setDoc(cartDoc(uid), { items: [] }, { merge: true });
  return ref.id;
}

export async function listUserOrders(uid: string, pageSize = 20): Promise<Order[]> {
  const qref = query(
    ordersCol(),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
    limit(pageSize),
  );
  const snap = await getDocs(qref);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderDoc) }));
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(orderDoc(id), { status });
}
