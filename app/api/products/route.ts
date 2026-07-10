import { getPaginationMeta, getPaginationParams } from "@/lib/api/pagination";
import { fail, ok } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = getPaginationParams(searchParams);
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, product_categories(*)", { count: "exact" })
    .eq("status", "published")
    .order(searchParams.get("sort") ?? "sort_order", {
      ascending: searchParams.get("order") === "asc",
    })
    .range(from, to);

  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const search = searchParams.get("search");

  if (category) {
    query = query.eq("product_categories.slug", category);
  }

  if (featured === "true") {
    query = query.eq("is_featured", true);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return fail("DATABASE_ERROR", "Không thể tải danh sách sản phẩm", {
      status: 500,
      details: error.message,
    });
  }

  return ok(data ?? [], {
    meta: getPaginationMeta(count ?? 0, page, limit),
  });
}
