import { z } from "zod";

export const leadSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  company: z.string().optional(),
  leadType: z.enum(["individual", "business", "architect"]).default("individual"),
  source: z.string().default("website"),
  sourceUrl: z.string().url("URL nguồn không hợp lệ").optional().or(z.literal("")),
  productInterest: z.string().uuid("Sản phẩm quan tâm không hợp lệ").optional(),
  projectDescription: z.string().max(3000).optional(),
  budgetRange: z.string().optional(),
  areaSize: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().max(2000).optional(),
  chatSessionId: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export const updateLeadSchema = z.object({
  status: z
    .enum([
      "new",
      "contacted",
      "qualified",
      "proposal_sent",
      "negotiating",
      "won",
      "lost",
      "spam",
    ])
    .optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export const leadActivitySchema = z.object({
  leadId: z.string().uuid(),
  type: z.enum(["note", "call", "email", "meeting", "status_change", "assignment"]),
  content: z.string().max(3000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadActivityInput = z.infer<typeof leadActivitySchema>;
