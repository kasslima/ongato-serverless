import { z } from "zod";
import { cursorQuerySchema } from "../../shared/validation/schema";

export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["admin", "dev"]).default("dev"),
    createdAt: z.string().nullable()
});
export type User = z.infer<typeof userSchema>;


export const userCreateSchema = userSchema.omit({
    id: true,
    createdAt: true
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;


export const userUpdateSchema = userCreateSchema
  .pick({
    email: true,
    password: true,
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser enviado para atualização"
  });
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const userResponseSchema = userSchema.omit({
    password: true
});
export type UserResponse = z.infer<typeof userResponseSchema>;

export const userListQuerySchema = cursorQuerySchema.extend({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().min(1).optional(),
});
export type UserListQuery = z.infer<typeof userListQuerySchema>;
