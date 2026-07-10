import { getPaginationMeta, getPaginationParams } from "@/lib/api/pagination";
import { fail, ok } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = getPaginationParams(searchParams);
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("completion_date", { ascending: false })
    .range(from, to);

  const featured = searchParams.get("featured");
  const search = searchParams.get("search");

  if (featured === "true") {
    query = query.eq("is_featured", true);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return fail("DATABASE_ERROR", "Không thể tải danh sách dự án", {
      status: 500,
      details: error.message,
    });
  }

  return ok(data ?? [], {
    meta: getPaginationMeta(count ?? 0, page, limit),
  });
}
