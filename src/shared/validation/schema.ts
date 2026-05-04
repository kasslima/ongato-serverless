import { z } from "zod";

//id
export const idParamSchema = z.object({
  id: z.coerce.number()
    .int({ message: "O parâmetro precisa ser um número inteiro" })
    .positive({ message: "O número precisa ser maior de 0" })
})

// query
export const cursorQuerySchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
export type CursorQuerySchemaDTO = z.infer<typeof cursorQuerySchema>;
