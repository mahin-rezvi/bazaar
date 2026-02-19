import {
  CollectionReference,
  DocumentReference,
  FieldValue,
  Timestamp,
  collection,
  doc,
} from "firebase/firestore";

import { getFirebaseClient } from "@/lib/firebase";
import type { Category, OrderStatus } from "@/lib/constants";

export type UserRole = "user" | "admin";

export type UserProfileDoc = {
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
};

export type UserPrefsDoc = {
  marketingEmail?: boolean;
};

export type UserDoc = {
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  profile?: UserProfileDoc;
  prefs?: UserPrefsDoc;
  role: UserRole;
  createdAt: Timestamp | FieldValue;
};

export type ProductDoc = {
  title: string;
  titleLower: string;
  description: string;
  highlights: string[];
  price: number;
  images: string[];
  category: Category;
  stock: number;
  ratingAvg: number;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
};

export type CartItem = {
  productId: string;
  title: string;
  image: string | null;
  price: number;
  qty: number;
};

export type CartDoc = {
  items: CartItem[];
};

export type OrderItem = CartItem;

export type OrderDoc = {
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  customer?: {
    name: string;
    email: string | null;
    phone: string;
  };
  shipping?: {
    address: string;
    city: string;
  };
  createdAt: Timestamp | FieldValue;
};

export function usersCol(): CollectionReference<UserDoc> {
  const { db } = getFirebaseClient();
  return collection(db, "users") as CollectionReference<UserDoc>;
}

export function userDoc(uid: string): DocumentReference<UserDoc> {
  const { db } = getFirebaseClient();
  return doc(db, "users", uid) as DocumentReference<UserDoc>;
}

export function productsCol(): CollectionReference<ProductDoc> {
  const { db } = getFirebaseClient();
  return collection(db, "products") as CollectionReference<ProductDoc>;
}

export function productDoc(id: string): DocumentReference<ProductDoc> {
  const { db } = getFirebaseClient();
  return doc(db, "products", id) as DocumentReference<ProductDoc>;
}

export function cartsCol(): CollectionReference<CartDoc> {
  const { db } = getFirebaseClient();
  return collection(db, "carts") as CollectionReference<CartDoc>;
}

export function cartDoc(uid: string): DocumentReference<CartDoc> {
  const { db } = getFirebaseClient();
  return doc(db, "carts", uid) as DocumentReference<CartDoc>;
}

export function ordersCol(): CollectionReference<OrderDoc> {
  const { db } = getFirebaseClient();
  return collection(db, "orders") as CollectionReference<OrderDoc>;
}

export function orderDoc(id: string): DocumentReference<OrderDoc> {
  const { db } = getFirebaseClient();
  return doc(db, "orders", id) as DocumentReference<OrderDoc>;
}
