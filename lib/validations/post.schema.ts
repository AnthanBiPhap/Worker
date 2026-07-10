import { z } from "zod";

export const blogCategorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const postSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  coverImageAlt: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  publishedAt: z.string().datetime().nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  readTimeMin: z.coerce.number().int().positive().nullable().optional(),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(180).optional(),
  metaKeywords: z.string().optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
});

export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;
export type PostInput = z.infer<typeof postSchema>;
