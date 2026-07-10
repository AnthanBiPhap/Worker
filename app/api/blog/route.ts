import { getPaginationMeta, getPaginationParams } from "@/lib/api/pagination";
import { fail, ok } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = getPaginationParams(searchParams);
  const supabase = await createClient();

  let query = supabase
    .from("blog_posts")
    .select("*, blog_categories(*)", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  const category = searchParams.get("category");
  const search = searchParams.get("search");

  if (category) {
    query = query.eq("blog_categories.slug", category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return fail("DATABASE_ERROR", "Không thể tải danh sách bài viết", {
      status: 500,
      details: error.message,
    });
  }

  return ok(data ?? [], {
    meta: getPaginationMeta(count ?? 0, page, limit),
  });
}
