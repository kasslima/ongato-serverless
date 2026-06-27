import { z } from "zod"

export type Env = {
  DB: D1Database;
  IMAGES_BUCKET: R2Bucket;
  R2_PUBLIC_URL: string;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
  ENVIRONMENT?: "development" | "production";
  CORS_ALLOWED_ORIGINS?: string; // Separado por vírgula em produção
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
