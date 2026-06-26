import { z } from "zod";
import { cursorQuerySchema } from "../../shared/validation/schema";

const animalAttributesSchema = z
  .string()
  .trim()
  .min(1, "Os atributos nao podem estar vazios")
  .superRefine((value, ctx) => {
    if (value.includes(",,")) {
      ctx.addIssue({
        code: "custom",
        message: "Os atributos nao podem conter duas virgulas seguidas",
      });
    }

    if (value.startsWith(",") || value.endsWith(",")) {
      ctx.addIssue({
        code: "custom",
        message: "Os atributos nao podem comecar ou terminar com virgula",
      });
    }

    const items = value.split(",").map((item) => item.trim());

    if (items.some((item) => item.length === 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Cada atributo precisa ter um texto valido entre as virgulas",
      });
    }

    const duplicates = new Set<string>();
    for (const item of items) {
      const normalizedItem = item.toLocaleLowerCase();

      if (item.length > 40) {
        ctx.addIssue({
          code: "custom",
          message: "Cada atributo deve ter no maximo 40 caracteres",
        });
      }

      if (duplicates.has(normalizedItem)) {
        ctx.addIssue({
          code: "custom",
          message: "Os atributos nao podem estar duplicados",
        });
        break;
      }

      duplicates.add(normalizedItem);
    }
  })
  .nullable();

const formBooleanSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "true" || normalizedValue === "1") {
    return true;
  }

  if (normalizedValue === "false" || normalizedValue === "0") {
    return false;
  }

  return value;
}, z.boolean());

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
  attributes: animalAttributesSchema,
  description: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable()
});
export type Animal = z.infer<typeof animalSchema>;


export const animalCreateSchema = animalSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    attributes: animalAttributesSchema.optional(),
  });
export type AnimalCreate = z.infer<typeof animalCreateSchema>;

export const animalCreateInputSchema = animalCreateSchema.omit({
  imageUrl: true
}).extend({
  featured: formBooleanSchema,
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
  .extend({
    featured: formBooleanSchema,
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser enviado para atualização"
  })
  .strict();
export type AnimalUpdateInput = z.infer<typeof animalUpdateInputSchema>;

export const animalQuerySchema = cursorQuerySchema.extend({
  name: z.string().trim().min(1).optional(),
  age: z.enum([
    "0 a 6 meses",
    "6 a 12 meses",
    "1 a 2 anos",
    "2 a 5 anos",
    "5 a 9 anos",
    "mais de 9 anos"
  ]).optional(),
  type: z.enum(["gato", "cachorro"]).optional(),
  gender: z.enum(["macho", "femea"]).optional(),
  size: z.enum(["pequeno", "medio", "grande"]).optional(),
  featured: z.enum(["0", "1"])
    .transform((value) => value === "1")
    .optional(),
});
export type AnimalQuery = z.infer<typeof animalQuerySchema>;
