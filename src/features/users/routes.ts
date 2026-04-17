import { UserController } from "./controller";
import { UserService } from "./service";
import { UserRepository } from "./repository";
import { Env } from "../../shared/type";

export function usersRoutes(env: Env) {
  const repo = new UserRepository(env.DB);
  const service = new UserService(repo);
  const controller = new UserController(service);

  return {
    "POST /register": controller.register,
    "POST /login": controller.login,
  };
}