import { z } from "zod";

export const settingSchema = z.object({
  key: z.string().min(1, "Key cài đặt là bắt buộc"),
  value: z.unknown(),
  label: z.string().optional(),
});

export type SettingInput = z.infer<typeof settingSchema>;
