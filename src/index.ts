import { router } from "./router";
import { Env } from "./shared/type";
import {
  checkRateLimit,
  createTooManyRequestsResponse,
  getClientIp,
  isLoginRequest,
} from "./shared/rate-limit";


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { method } = request;
    const pathname = new URL(request.url).pathname;
    const clientIp = getClientIp(request);
    const globalKey = `global:${clientIp}`;

    const globalResult = await checkRateLimit(env.GLOBAL_RATE_LIMITER, globalKey);
    console.log("rate_limit_global", {
      method,
      pathname,
      clientIp,
      key: globalKey,
      success: globalResult.success,
    });

    if (!globalResult.success) {
      return createTooManyRequestsResponse();
    }

    if (isLoginRequest(method, pathname)) {
      const loginKey = `login:${clientIp}`;
      const loginResult = await checkRateLimit(env.LOGIN_RATE_LIMITER, loginKey);
      console.log("rate_limit_login", {
        method,
        pathname,
        clientIp,
        key: loginKey,
        success: loginResult.success,
      });

      if (!loginResult.success) {
        return createTooManyRequestsResponse();
      }
    }

    return router(request, env, ctx);
  },
};
