import { UserController } from "./controller";
import { UserService } from "./service";
import { UserRepository } from "./repository";
import { Env } from "../../shared/type";
import { withAuth } from "../../shared/auth/middleware";

export function usersRoutes(env: Env) {
  const repo = new UserRepository(env.DB);
  const service = new UserService(repo);
  const controller = new UserController(service);

  return {
    "GET /users": withAuth({ roles: ["admin"] })(
    (req, _env, _ctx, _user) => controller.getAll(req)
    ),

    "POST /users": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _user) => controller.create(req)
    ),
  };
}

