import { AnimalController } from "./controller";
import { AnimalService } from "./service";
import { AnimalRepository } from "./repository";
import { Env } from "../../shared/type";
import { withAuth } from "../../shared/auth/middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { animalCreateInputSchema, animalSchema, animalUpdateInputSchema } from "./schema";
import { z } from "zod";
import { validationErrorSchema, errorResponseSchema } from "../../shared/errors/schema";
import { idParamSchema } from "../../shared/validation/schema";
import { MockImageUploadRepository } from "../../shared/storage/image-storage";

export function registerAnimalsOpenApi(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/animals',
    description: 'Get all animals',
    summary: 'Retrieve animals',
    responses: {
      200: {
        description: 'Animals retrieved',
        content: {
          'application/json': {
            schema: z.object({
              result: z.array(animalSchema),
              message: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/animals',
    description: 'Create a new animal',
    summary: 'Create animal',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: animalCreateInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Animal created',
        content: {
          'application/json': {
            schema: z.object({
              result: animalSchema,
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
    path: '/animals/{id}',
    description: 'Delete a animal by ID',
    summary: 'Delete animal',
    security: [{ bearerAuth: [] }],
    request: {
      params: idParamSchema
    },
    responses: {
      203: {
        description: 'Animal deleted',
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
      404: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/animals/{id}',
    description: 'Update your animal',
    summary: 'Update animal',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: animalUpdateInputSchema,
          },
          'application/json': {
            schema: animalUpdateInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Animal updated',
        content: {
          'application/json': {
            schema: z.object({
              result: animalSchema,
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
      404: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });
}

export function animalsRoutes(env: Env) {
  const repo = new AnimalRepository(env.DB);
  const imageRepo = new MockImageUploadRepository();
  const service = new AnimalService(repo, imageRepo);
  const controller = new AnimalController(service);

  return {
    "GET /animals": (req: Request) => controller.getAll(req),

    "POST /animals": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _animal) => controller.create(req)
    ),

    "DELETE /animals/:id": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _animal, params) => controller.delete(req, params)
    ),

    "PATCH /animals/:id": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _animal, params) => controller.update(req, params)
    ),
  };
}
