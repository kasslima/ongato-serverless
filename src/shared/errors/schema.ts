import { z } from "zod";

export const validationErrorSchema = z.object({
  fieldErrors: z.record(z.string(), z.array(z.string())),
  formErrors: z.array(z.string())
})

export const errorResponseSchema = z.object({
  message: z.string()
})
