import { DocumentSnapshot, QueryConstraint, getDocs, limit, orderBy, query, startAfter } from "firebase/firestore";

import { ordersCol, usersCol, type OrderDoc, type UserDoc } from "@/lib/db";

export type AdminOrder = OrderDoc & { id: string };
export type AdminUser = UserDoc & { uid: string };

export async function listOrdersPage({
  pageSize = 25,
  cursor,
}: {
  pageSize?: number;
  cursor?: DocumentSnapshot<OrderDoc> | null;
}): Promise<{ items: AdminOrder[]; nextCursor: DocumentSnapshot<OrderDoc> | null }> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(pageSize));
  const qref = query(ordersCol(), ...constraints);
  const snap = await getDocs(qref);
  const docs = snap.docs as DocumentSnapshot<OrderDoc>[];
  return {
    items: docs.map((d) => ({ id: d.id, ...(d.data() as OrderDoc) })),
    nextCursor: docs.length ? docs[docs.length - 1] : null,
  };
}

export async function listUsers(pageSize = 50): Promise<AdminUser[]> {
  const qref = query(usersCol(), orderBy("createdAt", "desc"), limit(pageSize));
  const snap = await getDocs(qref);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as UserDoc) }));
}
