import { UserController } from "./controller";
import { UserService } from "./service";
import { UserRepository } from "./repository";
import { Env } from "../../shared/type";
import { withAuth } from "../../shared/auth/middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { userSchema, userCreateSchema } from "./schema";
import { z } from "zod";
import { validationErrorSchema, errorResponseSchema } from "../../shared/errors/schema";
import { idParamSchema } from "../../shared/validation/schema";

export function registerUsersOpenApi(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/users',
    description: 'Get all users',
    summary: 'Retrieve users',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Users retrieved',
        content: {
          'application/json': {
            schema: z.object({
              result: z.array(userSchema),
              message: z.string(),
            }),
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
      403: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/users',
    description: 'Create a new user',
    summary: 'Create user',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: userCreateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User created',
        content: {
          'application/json': {
            schema: z.object({
              result: userSchema,
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
      403: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/users/{id}',
    description: 'Delete a user by ID',
    summary: 'Delete user',
    security: [{ bearerAuth: [] }],
    request: {
      params: idParamSchema
    },
    responses: {
      203: {
        description: 'User deleted',
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
      403: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });
}

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

    "DELETE /users/:id": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _user, params) => controller.delete(req, params)
    ),
  };
}

