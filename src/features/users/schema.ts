import { z } from "zod";

export const userSchema = z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["admin", "dev"]).default("dev"),
    description: z.string().optional(),
    createdAt: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

