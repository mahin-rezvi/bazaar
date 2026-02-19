import { z } from "zod";
import { CATEGORIES, ORDER_STATUSES } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  displayName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const productSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(20).max(2000),
  highlights: z.array(z.string().min(2).max(120)).catch([]),
  price: z.number().min(0),
  images: z.array(z.string().url()).catch([]),
  category: z.enum(CATEGORIES),
  stock: z.number().int().min(0),
  ratingAvg: z.number().min(0).max(5).catch(0),
});

export const orderStatusSchema = z.enum(ORDER_STATUSES);
