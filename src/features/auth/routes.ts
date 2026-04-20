import { AuthController } from "./controller";
import { AuthService } from "./service";
import { UserRepository } from "../users/repository";
import { Env } from "../../shared/type";


export function authsRoutes(env: Env) {
  const repo = new UserRepository(env.DB);
  const service = new AuthService(repo);
  const controller = new AuthController(service);

  return {
    "POST /auth/login": (req: Request) => controller.login(req),
  };
}