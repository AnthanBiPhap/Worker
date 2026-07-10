import { z } from "zod";

export const mediaMetadataSchema = z.object({
  fileName: z.string().min(1, "Tên file là bắt buộc"),
  filePath: z.string().min(1, "Đường dẫn file là bắt buộc"),
  fileUrl: z.string().url("URL file không hợp lệ"),
  fileType: z.string().min(1, "Loại file là bắt buộc"),
  fileSize: z.coerce.number().int().nonnegative().nullable().optional(),
  width: z.coerce.number().int().positive().nullable().optional(),
  height: z.coerce.number().int().positive().nullable().optional(),
  altText: z.string().optional(),
  folder: z.string().optional(),
});

export type MediaMetadataInput = z.infer<typeof mediaMetadataSchema>;
