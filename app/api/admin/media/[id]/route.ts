import { AuthError, requireEditor } from "@/lib/auth/permissions";
import { fail, ok } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireEditor();
    const { id } = await context.params;
    const supabase = await createClient();

    const { data: media, error: findError } = await supabase
      .from("media_files")
      .select("*")
      .eq("id", id)
      .single();

    if (findError) {
      return fail("NOT_FOUND", "Không tìm thấy media", {
        status: 404,
        details: findError.message,
      });
    }

    const [bucket, ...pathParts] = media.file_path.split("/");
    const objectPath = pathParts.join("/");

    if (bucket && objectPath) {
      await supabase.storage.from(bucket).remove([objectPath]);
    }

    const { error: deleteError } = await supabase
      .from("media_files")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return fail("DATABASE_ERROR", "Không thể xóa media", {
        status: 500,
        details: deleteError.message,
      });
    }

    return ok({ id });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, {
        status: error.code === "UNAUTHORIZED" ? 401 : 403,
      });
    }

    return fail("UNKNOWN_ERROR", "Không thể xóa media", { status: 500 });
  }
}
