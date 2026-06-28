import { router } from "./router";
import { Env } from "./shared/type";
import {
  createTooManyRequestsResponse,
  getClientIp,
  isLoginRequest,
  isRateLimited,
} from "./shared/rate-limit";


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { method } = request;
    const pathname = new URL(request.url).pathname;
    const clientIp = getClientIp(request);

    const isGlobalBlocked = await isRateLimited(env.GLOBAL_RATE_LIMITER, `global:${clientIp}`);
    if (isGlobalBlocked) {
      return createTooManyRequestsResponse();
    }

    if (isLoginRequest(method, pathname)) {
      const isLoginBlocked = await isRateLimited(env.LOGIN_RATE_LIMITER, `login:${clientIp}`);
      if (isLoginBlocked) {
        return createTooManyRequestsResponse();
      }
    }

    return router(request, env, ctx);
  },
};
