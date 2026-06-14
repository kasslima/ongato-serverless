import { z } from "zod";
import { cursorQuerySchema } from "../../shared/validation/schema";

export const animalSchema = z.object({
  id: z.number(),
  name: z.string(),
  imageUrl: z.string(),
  age: z.enum([
    "0 a 6 meses",
    "6 a 12 meses",
    "1 a 2 anos",
    "2 a 5 anos",
    "5 a 9 anos",
    "mais de 9 anos"
  ]),
  gender: z.enum(["macho", "femea"]),
  size: z.enum(["pequeno", "medio", "grande"]),
  type: z.enum(["gato", "cachorro"]),
  featured: z.boolean(),
  description: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable()
});
export type Animal = z.infer<typeof animalSchema>;


export const animalCreateSchema = animalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type AnimalCreate = z.infer<typeof animalCreateSchema>;

export const animalCreateInputSchema = animalCreateSchema.omit({
  imageUrl: true
});
export type AnimalCreateInput = z.infer<typeof animalCreateInputSchema>;


export const animalUpdateSchema = animalSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser enviado para atualização"
  });
export type AnimalUpdate = z.infer<typeof animalUpdateSchema>;

export const animalUpdateInputSchema = animalSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    imageUrl: true
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser enviado para atualização"
  })
  .strict();
export type AnimalUpdateInput = z.infer<typeof animalUpdateInputSchema>;

export const animalQuerySchema = cursorQuerySchema.extend({
  name: z.string().trim().min(1).optional(),
  type: z.enum(["gato", "cachorro"]).optional(),
  gender: z.enum(["macho", "femea"]).optional(),
});
export type AnimalQuery = z.infer<typeof animalQuerySchema>;
