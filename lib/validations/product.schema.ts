import { z } from "zod";

export const productCategorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(180).optional(),
});

export const productSchema = z.object({
  categoryId: z.string().uuid("Danh mục không hợp lệ"),
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  sku: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  specifications: z.record(z.string(), z.unknown()).default({}),
  priceFrom: z.coerce.number().nonnegative().nullable().optional(),
  priceTo: z.coerce.number().nonnegative().nullable().optional(),
  images: z.array(z.record(z.string(), z.unknown())).default([]),
  catalogUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  isFeatured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(180).optional(),
  metaKeywords: z.string().optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
});

export const productColorSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1, "Tên màu là bắt buộc"),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu không hợp lệ").optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});

export type ProductCategoryInput = z.infer<typeof productCategorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductColorInput = z.infer<typeof productColorSchema>;
