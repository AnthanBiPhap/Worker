import { AuthError, requireAdmin } from "@/lib/auth/permissions";
import { getPaginationMeta, getPaginationParams } from "@/lib/api/pagination";
import { fail, ok } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiating",
  "won",
  "lost",
  "spam",
] as const;

const LEAD_TYPES = ["individual", "business", "architect"] as const;

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const { page, limit, from, to } = getPaginationParams(searchParams);
    const supabase = await createClient();

    let query = supabase
      .from("leads")
      .select("*, products(id, name, slug)", { count: "exact" })
      .order(searchParams.get("sort") ?? "created_at", {
        ascending: searchParams.get("order") === "asc",
      })
      .range(from, to);

    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const leadType = searchParams.get("leadType");
    const search = searchParams.get("search");

    if (LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
      query = query.eq("status", status as (typeof LEAD_STATUSES)[number]);
    }

    if (source) {
      query = query.eq("source", source);
    }

    if (LEAD_TYPES.includes(leadType as (typeof LEAD_TYPES)[number])) {
      query = query.eq("lead_type", leadType as (typeof LEAD_TYPES)[number]);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return fail("DATABASE_ERROR", "Không thể tải danh sách lead", {
        status: 500,
        details: error.message,
      });
    }

    return ok(data ?? [], {
      meta: getPaginationMeta(count ?? 0, page, limit),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, {
        status: error.code === "UNAUTHORIZED" ? 401 : 403,
      });
    }

    return fail("UNKNOWN_ERROR", "Không thể tải danh sách lead", { status: 500 });
  }
}
