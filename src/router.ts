import { authsRoutes } from "./features/auth/routes";
import { usersRoutes } from "./features/user/routes";
import { docsRoutes } from "./features/docs/routes";
import { Env } from "./shared/type";
import { bannersRoutes } from "./features/banner/routes";

//import { petsRoutes } from "./features/pets/routes";

type RouteHandler = (
  req: Request,
  env: Env,
  ctx: ExecutionContext,
  params: Record<string, string>
) => Promise<Response> | Response;

function matchRoute(
  routeKey: string,
  method: string,
  pathname: string
): Record<string, string> | null {
  const [routeMethod, routePath] = routeKey.split(" ");

  if (routeMethod !== method) {
    return null;
  }

  const routeSegments = routePath.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);

  if (routeSegments.length !== pathSegments.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < routeSegments.length; i += 1) {
    const routeSegment = routeSegments[i];
    const pathSegment = pathSegments[i];

    if (routeSegment.startsWith(":")) {
      params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
      continue;
    }

    if (routeSegment !== pathSegment) {
      return null;
    }
  }

  return params;
}

export async function router( req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(req.url);

  const routes: Record<string, RouteHandler> = {
    ...usersRoutes(env),
    ...authsRoutes(env),
    ...bannersRoutes(env),
    ...docsRoutes(),

  };

  let handler: RouteHandler | undefined;
  let params: Record<string, string> = {};

  for (const [routeKey, routeHandler] of Object.entries(routes)) {
    const matchedParams = matchRoute(routeKey, req.method, url.pathname);
    if (matchedParams) {
      handler = routeHandler;
      params = matchedParams;
      break;
    }
  }

  if (!handler) {
    return new Response("Not Found", { status: 404 });
  }

  return handler(req, env, ctx, params);
}
