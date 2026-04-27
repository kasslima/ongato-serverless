import { AuthController } from "./controller";
import { AuthService } from "./service";
import { UserRepository } from "../user/repository";
import { Env } from "../../shared/type";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { authSchema } from "./schema";
import { z } from "zod";
import { validationErrorSchema, errorResponseSchema } from "../../shared/errors/schema";

export function registerAuthOpenApi(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    description: 'Login to get JWT token',
    summary: 'User login',
    request: {
      body: {
        content: {
          'application/json': {
            schema: authSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: z.object({
              result: z.object({ token: z.string() }),
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: validationErrorSchema,
          },
        },
      },
      401: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });
}

export function authsRoutes(env: Env) {
  const repo = new UserRepository(env.DB);
  const service = new AuthService(repo);
  const controller = new AuthController(service);

  return {
    "POST /auth/login": (req: Request) => controller.login(req),
  };
}
