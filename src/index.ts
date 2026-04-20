import { router } from "./router";
import { Env } from "./shared/type";


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router(request, env, ctx);
  },
};
