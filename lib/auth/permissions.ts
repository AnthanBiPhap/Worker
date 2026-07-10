import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type AuthProfile = Tables<"profiles">;

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: "UNAUTHORIZED" | "FORBIDDEN" = "UNAUTHORIZED",
  ) {
    super(message);
  }
}

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function requireAdmin(): Promise<AuthProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    throw new AuthError("Bạn cần đăng nhập để thực hiện thao tác này");
  }

  if (!["super_admin", "admin"].includes(profile.role)) {
    throw new AuthError("Bạn không có quyền quản trị", "FORBIDDEN");
  }

  return profile;
}

export async function requireEditor(): Promise<AuthProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    throw new AuthError("Bạn cần đăng nhập để thực hiện thao tác này");
  }

  if (!["super_admin", "admin", "editor"].includes(profile.role)) {
    throw new AuthError("Bạn không có quyền chỉnh sửa nội dung", "FORBIDDEN");
  }

  return profile;
}
