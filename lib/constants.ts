export const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Sports",
  "Books",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "canceled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

