"use server";

import { actionFail, actionOk } from "@/lib/api/response";
import { AuthError, requireEditor } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { postSchema, type PostInput } from "@/lib/validations/post.schema";
import type { ApiResponse } from "@/types/api.types";
import type { Tables } from "@/types/database.types";

function toPostPayload(input: PostInput, authorId?: string) {
  return {
    category_id: input.categoryId ?? null,
    author_id: authorId,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt ?? null,
    content: input.content ?? null,
    cover_image_url: input.coverImageUrl || null,
    cover_image_alt: input.coverImageAlt ?? null,
    status: input.status,
    published_at: input.publishedAt ?? null,
    scheduled_at: input.scheduledAt ?? null,
    read_time_min: input.readTimeMin ?? null,
    tags: input.tags,
    meta_title: input.metaTitle ?? null,
    meta_description: input.metaDescription ?? null,
    meta_keywords: input.metaKeywords ?? null,
    og_image_url: input.ogImageUrl || null,
    canonical_url: input.canonicalUrl || null,
  };
}

export async function createPost(
  input: PostInput,
): Promise<ApiResponse<Tables<"blog_posts">>> {
  try {
    const profile = await requireEditor();
    const parsed = postSchema.safeParse(input);

    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "Dữ liệu bài viết không hợp lệ", parsed.error.flatten());
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .insert(toPostPayload(parsed.data, profile.id))
      .select("*")
      .single();

    if (error) {
      return actionFail("DATABASE_ERROR", "Không thể tạo bài viết", error.message);
    }

    return actionOk(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể tạo bài viết");
  }
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<ApiResponse<Tables<"blog_posts">>> {
  try {
    await requireEditor();
    const parsed = postSchema.safeParse(input);

    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "Dữ liệu bài viết không hợp lệ", parsed.error.flatten());
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .update(toPostPayload(parsed.data))
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return actionFail("DATABASE_ERROR", "Không thể cập nhật bài viết", error.message);
    }

    return actionOk(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể cập nhật bài viết");
  }
}
