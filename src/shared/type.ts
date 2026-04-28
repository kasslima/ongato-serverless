import { z } from "zod"

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
};

export const multipartFileSchema = z.object({
  imageBuffer: z.instanceof(ArrayBuffer),
  fileName: z.string(),
  fileType: z.string(),
});

export type MultipartFile = z.infer<typeof multipartFileSchema>;

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> }