import { z } from "zod";
import { userSchema } from "../users/schema";

export const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),

});
export type Auth = z.infer<typeof authSchema>;

export const jwtSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: userSchema.shape.role,
});

export type Jwt = z.infer<typeof jwtSchema>;
