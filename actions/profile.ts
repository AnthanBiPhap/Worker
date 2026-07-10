"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { actionFail, actionOk } from "@/lib/api/response";
import { MAX_IMAGE_SIZE } from "@/lib/constants/enums";
import type { ApiResponse } from "@/types/api.types";

const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getAvatarExtension(fileName: string, mimeType: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "jpg" || extension === "jpeg") return ".jpg";
  if (extension === "png") return ".png";
  if (extension === "webp") return ".webp";

  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";

  return ".jpg";
}

const PROFILE_FIELDS = [
  "first_name",
  "last_name",
  "phone",
  "job_title",
  "bio",
  "country",
  "city_state",
  "postal_code",
  "tax_id",
  "facebook_url",
  "x_url",
  "linkedin_url",
  "instagram_url",
] as const;

type ProfileField = (typeof PROFILE_FIELDS)[number];

function getString(formData: FormData, key: ProfileField): string | null | undefined {
  if (!formData.has(key)) {
    return undefined;
  }

  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateProfile(
  formData: FormData,
): Promise<ApiResponse<{ success: true }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return actionFail("UNAUTHORIZED", "Bạn cần đăng nhập để cập nhật profile");
  }

  const payload = PROFILE_FIELDS.reduce<Partial<Record<ProfileField, string | null>>>(
    (acc, key) => {
      const value = getString(formData, key);

      if (value !== undefined) {
        acc[key] = value;
      }

      return acc;
    },
    {},
  );

  const shouldUpdateName =
    Object.prototype.hasOwnProperty.call(payload, "first_name") ||
    Object.prototype.hasOwnProperty.call(payload, "last_name");
  const fullName = shouldUpdateName
    ? [payload.first_name, payload.last_name].filter(Boolean).join(" ").trim()
    : undefined;

  let avatarUrl: string | undefined;

  const avatarFile = formData.get("avatar");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!ALLOWED_AVATAR_TYPES.has(avatarFile.type)) {
      return actionFail(
        "VALIDATION_ERROR",
        "Ảnh đại diện phải là JPG, PNG hoặc WEBP",
      );
    }

    if (avatarFile.size > MAX_IMAGE_SIZE) {
      return actionFail(
        "VALIDATION_ERROR",
        "Ảnh đại diện không được lớn hơn 5MB",
      );
    }

    const filePath = `${user.id}/avatar${getAvatarExtension(avatarFile.name, avatarFile.type)}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        contentType: avatarFile.type,
        upsert: true,
      });

    if (uploadError) {
      return actionFail("STORAGE_ERROR", uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...payload,
      ...(shouldUpdateName ? { full_name: fullName || null } : {}),
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return actionFail("PROFILE_UPDATE_FAILED", error.message);
  }

  revalidatePath("/profile");

  return actionOk({ success: true });
}
