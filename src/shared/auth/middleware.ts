import { Jwt } from "../../features/auth/schema";
import { verifyToken } from "./jwt";

type AuthenticatedHandler = (
  req: Request,
  env: any,
  ctx: any,
  user: Jwt,
  params: Record<string, string>
) => Promise<Response> | Response;

export function withAuth(options?: { roles?: string[] }) {
  return (handler: AuthenticatedHandler) => {
    return async (
      req: Request,
      env: any,
      ctx: any,
      params: Record<string, string>
    ) => {
      const authHeader = req.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Not authorized", { status: 401 });
      }

      const token = authHeader.split(" ")[1];

      try {
        const user = await verifyToken(token);

        if (options?.roles && !options.roles.includes(user.role)) {
          return new Response("Permission denied", { status: 403 });
        }

        return handler(req, env, ctx, user, params);
      } catch {
        return new Response("Invalid token", { status: 401 });
      }
    };
  };
}
