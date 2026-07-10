import { AuthError, requireAdmin } from "@/lib/auth/permissions";
import { fail, ok } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { updateLeadSchema } from "@/lib/validations/lead.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("leads")
      .select("*, products(id, name, slug), lead_activities(*)")
      .eq("id", id)
      .single();

    if (error) {
      return fail("NOT_FOUND", "Không tìm thấy lead", {
        status: 404,
        details: error.message,
      });
    }

    return ok(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, {
        status: error.code === "UNAUTHORIZED" ? 401 : 403,
      });
    }

    return fail("UNKNOWN_ERROR", "Không thể tải lead", { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const profile = await requireAdmin();
    const { id } = await context.params;
    const body: unknown = await request.json().catch(() => null);
    const parsed = updateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Dữ liệu lead không hợp lệ", {
        status: 422,
        details: parsed.error.flatten(),
      });
    }

    const supabase = await createClient();
    const payload = parsed.data;
    const { data, error } = await supabase
      .from("leads")
      .update({
        status: payload.status,
        priority: payload.priority,
        assigned_to: payload.assignedTo,
        notes: payload.notes,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return fail("DATABASE_ERROR", "Không thể cập nhật lead", {
        status: 500,
        details: error.message,
      });
    }

    if (payload.status) {
      await supabase.from("lead_activities").insert({
        lead_id: id,
        user_id: profile.id,
        type: "status_change",
        content: `Cập nhật trạng thái lead thành ${payload.status}`,
        metadata: { new_status: payload.status },
      });
    }

    return ok(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(error.code, error.message, {
        status: error.code === "UNAUTHORIZED" ? 401 : 403,
      });
    }

    return fail("UNKNOWN_ERROR", "Không thể cập nhật lead", { status: 500 });
  }
}
