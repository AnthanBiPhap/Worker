import { AuthError, requireAdmin } from "@/lib/auth/permissions";
import { fail, ok } from "@/lib/api/response";
import { getDashboardData } from "@/lib/admin/dashboard";

export async function GET() {
  try {
    await requireAdmin();

    return ok(await getDashboardData());
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, {
        status: error.code === "UNAUTHORIZED" ? 401 : 403,
      });
    }

    return fail("DATABASE_ERROR", "Không thể tải dữ liệu dashboard", {
      status: 500,
      details: error instanceof Error ? error.message : error,
    });
  }
}
