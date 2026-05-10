import { SignJWT, jwtVerify } from "jose";
import { Jwt, jwtSchema } from "../../features/auth/schema";

function getSecretKey(jwtSecret: string): Uint8Array {
  if (!jwtSecret || !jwtSecret.trim()) {
    throw new Error("JWT secret is not configured");
  }

  return new TextEncoder().encode(jwtSecret);
}

export async function generateToken(payload: any, jwtSecret: string) {
  const secret = getSecretKey(jwtSecret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);
}

export async function verifyToken(token: string, jwtSecret: string): Promise<Jwt> {
  const secret = getSecretKey(jwtSecret);
  const { payload } = await jwtVerify(token, secret);

  const parsed = jwtSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("Invalid token");
  }

  return parsed.data;
}
