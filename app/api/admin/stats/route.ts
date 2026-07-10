import { AuthError, requireAdmin } from "@/lib/auth/permissions";
import { fail, ok } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      leadsTotal,
      leadsToday,
      productsPublished,
      postsPublished,
      projectsPublished,
      recentLeads,
    ] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("leads")
        .select("id, full_name, phone, status, source, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const firstError = [
      leadsTotal.error,
      leadsToday.error,
      productsPublished.error,
      postsPublished.error,
      projectsPublished.error,
      recentLeads.error,
    ].find(Boolean);

    if (firstError) {
      return fail("DATABASE_ERROR", "Không thể tải thống kê", {
        status: 500,
        details: firstError.message,
      });
    }

    return ok({
      leads: {
        total: leadsTotal.count ?? 0,
        today: leadsToday.count ?? 0,
      },
      content: {
        publishedProducts: productsPublished.count ?? 0,
        publishedPosts: postsPublished.count ?? 0,
        publishedProjects: projectsPublished.count ?? 0,
      },
      recentLeads: recentLeads.data ?? [],
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, {
        status: error.code === "UNAUTHORIZED" ? 401 : 403,
      });
    }

    return fail("UNKNOWN_ERROR", "Không thể tải thống kê", { status: 500 });
  }
}
