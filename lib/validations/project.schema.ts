import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(3, "Tên dự án phải có ít nhất 3 ký tự"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  clientName: z.string().optional(),
  location: z.string().optional(),
  area: z.string().optional(),
  projectType: z.string().optional(),
  completionDate: z.string().date().nullable().optional(),
  description: z.string().optional(),
  images: z.array(z.record(z.string(), z.unknown())).default([]),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.coerce.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(180).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
