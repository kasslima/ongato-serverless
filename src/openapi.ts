import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { registerAuthOpenApi } from './features/auth/routes';
import { registerUsersOpenApi } from './features/users/routes';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Create registry
export const registry = new OpenAPIRegistry();

let isOpenApiBootstrapped = false;

function bootstrapOpenApi() {
  if (isOpenApiBootstrapped) {
    return;
  }

  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  registerAuthOpenApi(registry);
  registerUsersOpenApi(registry);
  isOpenApiBootstrapped = true;
}

export function generateOpenApiDocument() {
  bootstrapOpenApi();
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Ongato Serverless API',
      version: '1.0.0',
      description: 'API documentation for Ongato serverless application',
    },
    servers: [
      {
        url: 'http://localhost:8787',
      },
    ],
  });
}
