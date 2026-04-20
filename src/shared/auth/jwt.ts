import { SignJWT, jwtVerify } from "jose";
import { TokenPayload, TokenPayloadSchema } from "../../features/auth/schema";
import { promise } from "zod";

const secret = new TextEncoder().encode("SUA_SECRET_AQUI");

export async function generateToken(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);

  const parsed = TokenPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("Payload inválido");
  }

  return parsed.data;
}