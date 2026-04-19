import { z } from "zod";

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