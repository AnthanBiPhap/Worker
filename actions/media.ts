"use server";

import { actionFail, actionOk } from "@/lib/api/response";
import { AuthError, requireEditor } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import {
  mediaMetadataSchema,
  type MediaMetadataInput,
} from "@/lib/validations/media.schema";
import type { ApiResponse } from "@/types/api.types";
import type { Tables } from "@/types/database.types";

export async function uploadMedia(
  input: MediaMetadataInput,
): Promise<ApiResponse<Tables<"media_files">>> {
  try {
    const profile = await requireEditor();
    const parsed = mediaMetadataSchema.safeParse(input);

    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "Dữ liệu media không hợp lệ", parsed.error.flatten());
    }

    const media = parsed.data;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("media_files")
      .insert({
        file_name: media.fileName,
        file_path: media.filePath,
        file_url: media.fileUrl,
        file_type: media.fileType,
        file_size: media.fileSize ?? null,
        width: media.width ?? null,
        height: media.height ?? null,
        alt_text: media.altText ?? null,
        folder: media.folder ?? null,
        uploaded_by: profile.id,
      })
      .select("*")
      .single();

    if (error) {
      return actionFail("DATABASE_ERROR", "Không thể lưu media", error.message);
    }

    return actionOk(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể lưu media");
  }
}
