import { UserController } from "./controller";
import { UserService } from "./service";
import { UserRepository } from "./repository";
import { Env } from "../../shared/type";

export function usersRoutes(env: Env) {
  const repo = new UserRepository(env.DB);
  const service = new UserService(repo);
  const controller = new UserController(service);

  return {
    "GET /users": (req: Request) => controller.getAll(req),
    "POST /users": (req: Request) => controller.create(req),
  };
}