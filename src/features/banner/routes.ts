import { BannerController } from "./controller";
import { BannerService } from "./service";
import { BannerRepository } from "./repository";
import { Env } from "../../shared/type";
import { withAuth } from "../../shared/auth/middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { bannerSchema, bannerCreateApiSchema, bannerUpdateApiSchema } from "./schema";
import { z } from "zod";
import { validationErrorSchema, errorResponseSchema } from "../../shared/errors/schema";
import { idParamSchema } from "../../shared/validation/schema";
import { MockImageUploadRepository } from "../../shared/storage/image-storage";

export function registerBannersOpenApi(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/banners',
    description: 'Get all banners',
    summary: 'Retrieve banners',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Banners retrieved',
        content: {
          'application/json': {
            schema: z.object({
              result: z.array(bannerSchema),
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
    path: '/banners',
    description: 'Create a new banner',
    summary: 'Create banner',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: bannerCreateApiSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Banner created',
        content: {
          'application/json': {
            schema: z.object({
              result: bannerSchema,
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
    path: '/banners/{id}',
    description: 'Delete a banner by ID',
    summary: 'Delete banner',
    security: [{ bearerAuth: [] }],
    request: {
      params: idParamSchema
    },
    responses: {
      203: {
        description: 'Banner deleted',
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
    path: '/banners/{id}',
    description: 'Update your banner',
    summary: 'Update banner',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: bannerUpdateApiSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Banner updated',
        content: {
          'application/json': {
            schema: z.object({
              result: bannerSchema,
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

export function bannersRoutes(env: Env) {
  const repo = new BannerRepository(env.DB);
  const imageRepo = new MockImageUploadRepository();
  const service = new BannerService(repo, imageRepo);
  const controller = new BannerController(service);

  return {
    "GET /banners": withAuth({ roles: ["admin", "dev"] })(
      (req, _env, _ctx, _banner) => controller.getAll(req)
    ),

    "POST /banners": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _banner) => controller.create(req)
    ),

    "DELETE /banners/:id": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _banner, params) => controller.delete(req, params)
    ),

    "PATCH /banners/:id": withAuth({ roles: ["dev"] })(
      (req, _env, _ctx, _banner, params) => controller.update(req, params)
    ),
  };
}
