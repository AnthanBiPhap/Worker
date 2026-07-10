"use server";

import { actionFail, actionOk } from "@/lib/api/response";
import { AuthError, requireAdmin } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { settingSchema, type SettingInput } from "@/lib/validations/settings.schema";
import type { ApiResponse } from "@/types/api.types";
import type { Json, Tables } from "@/types/database.types";

export async function updateSiteSettings(
  input: SettingInput,
): Promise<ApiResponse<Tables<"site_settings">>> {
  try {
    const profile = await requireAdmin();
    const parsed = settingSchema.safeParse(input);

    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "Dữ liệu cài đặt không hợp lệ", parsed.error.flatten());
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .upsert({
        key: parsed.data.key,
        value: parsed.data.value as Json,
        label: parsed.data.label ?? null,
        updated_by: profile.id,
      })
      .select("*")
      .single();

    if (error) {
      return actionFail("DATABASE_ERROR", "Không thể cập nhật cài đặt", error.message);
    }

    return actionOk(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể cập nhật cài đặt");
  }
}
