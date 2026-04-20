import { authsRoutes } from "./features/auth/routes";
import { usersRoutes } from "./features/users/routes";
import { Env } from "./shared/type";

//import { petsRoutes } from "./features/pets/routes";

type RouteHandler = (
  req: Request,
  env: Env,
  ctx: ExecutionContext
) => Promise<Response> | Response;

export async function router( req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(req.url);

  const routes: Record<string, RouteHandler> = {
    ...usersRoutes(env),
    ...authsRoutes(env),
    //...petsRoutes,
  };

  const key = `${req.method} ${url.pathname}`;

  const handler = routes[key];

  if (!handler) {
    return new Response("Not Found", { status: 404 });
  }

  return handler(req, env, ctx);
}
