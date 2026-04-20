import { TokenPayload } from "../../features/auth/schema";
import { verifyToken } from "./jwt";

type AuthenticatedHandler = (
  req: Request,
  env: any,
  ctx: any,
  user: TokenPayload
) => Promise<Response> | Response;

export function withAuth(options?: { roles?: string[] }) {
  return (handler: AuthenticatedHandler) => {
    return async (req: Request, env: any, ctx: any) => {
      const authHeader = req.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Não autorizado", { status: 401 });
      }

      const token = authHeader.split(" ")[1];

      try {
        const user = await verifyToken(token);

        if (options?.roles && !options.roles.includes(user.role)) {
          return new Response("Proibido", { status: 403 });
        }

        return handler(req, env, ctx, user);
      } catch {
        return new Response("Token inválido", { status: 401 });
      }
    };
  };
}