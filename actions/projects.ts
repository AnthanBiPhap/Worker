"use server";

import { actionFail, actionOk } from "@/lib/api/response";
import { AuthError, requireEditor } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { projectSchema, type ProjectInput } from "@/lib/validations/project.schema";
import type { ApiResponse } from "@/types/api.types";
import type { Json, Tables } from "@/types/database.types";

function toProjectPayload(input: ProjectInput, createdBy?: string) {
  return {
    title: input.title,
    slug: input.slug,
    client_name: input.clientName ?? null,
    location: input.location ?? null,
    area: input.area ?? null,
    project_type: input.projectType ?? null,
    completion_date: input.completionDate ?? null,
    description: input.description ?? null,
    images: input.images as Json,
    cover_image_url: input.coverImageUrl || null,
    is_featured: input.isFeatured,
    status: input.status,
    meta_title: input.metaTitle ?? null,
    meta_description: input.metaDescription ?? null,
    created_by: createdBy,
  };
}

export async function createProject(
  input: ProjectInput,
): Promise<ApiResponse<Tables<"projects">>> {
  try {
    const profile = await requireEditor();
    const parsed = projectSchema.safeParse(input);

    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "Dữ liệu dự án không hợp lệ", parsed.error.flatten());
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .insert(toProjectPayload(parsed.data, profile.id))
      .select("*")
      .single();

    if (error) {
      return actionFail("DATABASE_ERROR", "Không thể tạo dự án", error.message);
    }

    return actionOk(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể tạo dự án");
  }
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<ApiResponse<Tables<"projects">>> {
  try {
    await requireEditor();
    const parsed = projectSchema.safeParse(input);

    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "Dữ liệu dự án không hợp lệ", parsed.error.flatten());
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .update(toProjectPayload(parsed.data))
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return actionFail("DATABASE_ERROR", "Không thể cập nhật dự án", error.message);
    }

    return actionOk(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể cập nhật dự án");
  }
}
