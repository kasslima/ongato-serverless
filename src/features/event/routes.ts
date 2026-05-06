import { EventController } from "./controller";
import { EventService } from "./service";
import { EventRepository } from "./repository";
import { Env } from "../../shared/type";
import { withAuth } from "../../shared/auth/middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { eventCreateInputSchema, eventQuerySchema, eventSchema, eventUpdateInputSchema } from "./schema";
import { z } from "zod";
import { validationErrorSchema, errorResponseSchema } from "../../shared/errors/schema";
import { idParamSchema } from "../../shared/validation/schema";
import { R2ImageUploadRepository } from "../../shared/storage/image-storage";

export function registerEventsOpenApi(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/events',
    description: 'Get all events',
    summary: 'Retrieve events',
    request: {
      query: eventQuerySchema,
    },
    responses: {
      200: {
        description: 'Events retrieved',
        content: {
          'application/json': {
            schema: z.object({
              result: z.array(eventSchema),
              message: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/events',
    description: 'Create a new event',
    summary: 'Create event',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: eventCreateInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Event created',
        content: {
          'application/json': {
            schema: z.object({
              result: eventSchema,
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
    path: '/events/{id}',
    description: 'Delete a event by ID',
    summary: 'Delete event',
    security: [{ bearerAuth: [] }],
    request: {
      params: idParamSchema
    },
    responses: {
      203: {
        description: 'Event deleted',
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
    path: '/events/{id}',
    description: 'Update your event',
    summary: 'Update event',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: eventUpdateInputSchema,
          },
          'application/json': {
            schema: eventUpdateInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Event updated',
        content: {
          'application/json': {
            schema: z.object({
              result: eventSchema,
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

export function eventsRoutes(env: Env) {
  const repo = new EventRepository(env.DB);
  const imageRepo = new R2ImageUploadRepository(env.IMAGES_BUCKET, env.R2_PUBLIC_URL);
  const service = new EventService(repo, imageRepo);
  const controller = new EventController(service);

  return {
    "GET /events": (req: Request) => controller.getAll(req),

    "POST /events": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _event) => controller.create(req)
    ),

    "DELETE /events/:id": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _event, params) => controller.delete(req, params)
    ),

    "PATCH /events/:id": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _event, params) => controller.update(req, params)
    ),
  };
}
