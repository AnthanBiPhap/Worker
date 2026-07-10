"use server";

import type { LeadInput } from "@/lib/validations/lead.schema";
import {
  leadActivitySchema,
  leadSchema,
  updateLeadSchema,
  type LeadActivityInput,
  type UpdateLeadInput,
} from "@/lib/validations/lead.schema";
import { actionFail, actionOk } from "@/lib/api/response";
import { AuthError, requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types/api.types";
import type { Json, Tables } from "@/types/database.types";

export async function createLead(
  input: LeadInput,
): Promise<ApiResponse<{ id: string }>> {
  const parsed = leadSchema.safeParse(input);

  if (!parsed.success) {
    return actionFail("VALIDATION_ERROR", "Dữ liệu không hợp lệ", parsed.error.flatten());
  }

  const supabase = createAdminClient();
  const lead = parsed.data;

  const { data, error } = await supabase
    .from("leads")
    .insert({
      full_name: lead.fullName,
      phone: lead.phone,
      email: lead.email || null,
      company: lead.company || null,
      lead_type: lead.leadType,
      source: lead.source,
      source_url: lead.sourceUrl || null,
      product_interest: lead.productInterest ?? null,
      project_description: lead.projectDescription ?? null,
      budget_range: lead.budgetRange ?? null,
      area_size: lead.areaSize ?? null,
      location: lead.location ?? null,
      notes: lead.notes ?? null,
      chat_session_id: lead.chatSessionId ?? null,
      utm_source: lead.utmSource ?? null,
      utm_medium: lead.utmMedium ?? null,
      utm_campaign: lead.utmCampaign ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return actionFail("DATABASE_ERROR", "Không thể lưu thông tin tư vấn", error.message);
  }

  return actionOk({ id: data.id });
}

export async function updateLeadStatus(
  id: string,
  input: UpdateLeadInput,
): Promise<ApiResponse<Tables<"leads">>> {
  try {
    const profile = await requireAdmin();
    const parsed = updateLeadSchema.safeParse(input);

    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "Dữ liệu không hợp lệ", parsed.error.flatten());
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
      return actionFail("DATABASE_ERROR", "Không thể cập nhật lead", error.message);
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

    return actionOk(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể cập nhật lead");
  }
}

export async function createLeadActivity(
  input: LeadActivityInput,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const profile = await requireAdmin();
    const parsed = leadActivitySchema.safeParse(input);

    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "Dữ liệu không hợp lệ", parsed.error.flatten());
    }

    const supabase = await createClient();
    const activity = parsed.data;
    const { data, error } = await supabase
      .from("lead_activities")
      .insert({
        lead_id: activity.leadId,
        user_id: profile.id,
        type: activity.type,
        content: activity.content ?? null,
        metadata: (activity.metadata ?? null) as Json | null,
      })
      .select("id")
      .single();

    if (error) {
      return actionFail("DATABASE_ERROR", "Không thể lưu hoạt động lead", error.message);
    }

    return actionOk({ id: data.id });
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể lưu hoạt động lead");
  }
}
