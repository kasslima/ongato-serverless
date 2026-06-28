import { Env } from "./type";

const TOO_MANY_REQUESTS_MESSAGE = "Muitas requisições. Tente novamente mais tarde.";

type RateLimitResult = {
  success: boolean;
};

export type RateLimitCheckResult = RateLimitResult;

export function getClientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP")?.trim() || "unknown";
}

export function createTooManyRequestsResponse(): Response {
  return Response.json(
    {
      error: TOO_MANY_REQUESTS_MESSAGE,
    },
    { status: 429 }
  );
}

export async function isRateLimited(
  limiter: Env["GLOBAL_RATE_LIMITER"] | Env["LOGIN_RATE_LIMITER"],
  key: string
): Promise<boolean> {
  const result = (await limiter.limit({ key })) as RateLimitResult;
  return !result.success;
}

export async function checkRateLimit(
  limiter: Env["GLOBAL_RATE_LIMITER"] | Env["LOGIN_RATE_LIMITER"],
  key: string
): Promise<RateLimitCheckResult> {
  return (await limiter.limit({ key })) as RateLimitCheckResult;
}

export function isLoginRequest(method: string, pathname: string): boolean {
  return method === "POST" && pathname === "/auth/login";
}
