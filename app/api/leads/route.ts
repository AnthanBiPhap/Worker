import { fail, ok } from "@/lib/api/response";
import { createAdminClient } from "@/lib/supabase/admin";
import { leadSchema } from "@/lib/validations/lead.schema";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Dữ liệu tư vấn không hợp lệ", {
      status: 422,
      details: parsed.error.flatten(),
    });
  }

  const lead = parsed.data;
  const supabase = createAdminClient();
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
    return fail("DATABASE_ERROR", "Không thể lưu yêu cầu tư vấn", {
      status: 500,
      details: error.message,
    });
  }

  return ok(data, { status: 201 });
}
