import { AuthError, requireEditor } from "@/lib/auth/permissions";
import { fail, ok } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { MAX_IMAGE_SIZE, MAX_PDF_SIZE } from "@/lib/constants/enums";

const ALLOWED_BUCKETS = new Set([
  "products",
  "projects",
  "blog",
  "catalogs",
  "general",
  "avatars",
]);

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function getExtension(fileName: string): string {
  const extension = fileName.split(".").pop();
  return extension ? `.${extension.toLowerCase()}` : "";
}

export async function POST(request: Request) {
  try {
    const profile = await requireEditor();
    const formData = await request.formData();
    const file = formData.get("file");
    const bucket = String(formData.get("bucket") ?? "general");
    const altText = String(formData.get("altText") ?? "");

    if (!(file instanceof File)) {
      return fail("VALIDATION_ERROR", "File upload là bắt buộc", { status: 422 });
    }

    if (!ALLOWED_BUCKETS.has(bucket)) {
      return fail("VALIDATION_ERROR", "Bucket không hợp lệ", { status: 422 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return fail("VALIDATION_ERROR", "Loại file không được hỗ trợ", { status: 422 });
    }

    const maxSize = file.type === "application/pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      return fail("VALIDATION_ERROR", "File vượt quá dung lượng cho phép", { status: 422 });
    }

    const supabase = await createClient();
    const filePath = `${crypto.randomUUID()}${getExtension(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return fail("STORAGE_ERROR", "Không thể upload file", {
        status: 500,
        details: uploadError.message,
      });
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const { data, error } = await supabase
      .from("media_files")
      .insert({
        file_name: file.name,
        file_path: `${bucket}/${filePath}`,
        file_url: publicUrlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        alt_text: altText || null,
        folder: bucket,
        uploaded_by: profile.id,
      })
      .select("*")
      .single();

    if (error) {
      return fail("DATABASE_ERROR", "Không thể lưu thông tin media", {
        status: 500,
        details: error.message,
      });
    }

    return ok(data, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, {
        status: error.code === "UNAUTHORIZED" ? 401 : 403,
      });
    }

    return fail("UNKNOWN_ERROR", "Không thể upload media", { status: 500 });
  }
}
