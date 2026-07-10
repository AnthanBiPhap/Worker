import { fail, ok } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    return fail("NOT_FOUND", "Không tìm thấy dự án", {
      status: 404,
      details: error.message,
    });
  }

  return ok(data);
}
