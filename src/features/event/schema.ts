import { z } from "zod";
import { cursorQuerySchema } from "../../shared/validation/schema";

export const eventSchema = z.object({
  id: z.number(),
  title: z.string(),
  imageUrl: z.string(),
  text: z.string().nullable(),
  createdAt: z.string().nullable()
});
export type Event = z.infer<typeof eventSchema>;


export const eventCreateSchema = eventSchema.omit({
  id: true,
  createdAt: true
});
export type EventCreate = z.infer<typeof eventCreateSchema>;

export const eventCreateInputSchema = eventCreateSchema.omit({
  imageUrl: true
});
export type EventCreateInput = z.infer<typeof eventCreateInputSchema>;


export const eventUpdateSchema = eventSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser enviado para atualização"
  });
export type EventUpdate = z.infer<typeof eventUpdateSchema>;

export const eventUpdateInputSchema = eventSchema
  .omit({
    id: true,
    createdAt: true,
    imageUrl: true
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser enviado para atualização"
  })
  .strict();
export type EventUpdateInput = z.infer<typeof eventUpdateInputSchema>;

export const eventQuerySchema = cursorQuerySchema.extend({
  title: z.string().trim().min(1).optional(),
});
export type EventQuery = z.infer<typeof eventQuerySchema>;
