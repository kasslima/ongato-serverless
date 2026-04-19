import { z } from "zod";

export const userSchema = z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["admin", "dev"]).default("dev"),
    description: z.string().optional(),
    createdAt: z.coerce.date().optional(),
});

export type User = z.infer<typeof userSchema>;

export const userRecordSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().optional(),
    email: z.string().email(),
    passwordHash: z.string().min(1),
    role: z.enum(["admin", "dev"]),
    createdAt: z.string(),
});

export const createUserInputSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email(),
    passwordHash: z.string().min(1),
    role: z.enum(["admin", "dev"]).optional(),
});

export type UserRecord = z.infer<typeof userRecordSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

