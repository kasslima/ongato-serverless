import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Env } from "../../shared/type";
import { validationErrorSchema, errorResponseSchema } from "../../shared/errors/schema";
import { DonationController } from "./controller";
import { DonationRepository } from "./repository";
import { donationCheckoutInputSchema, donationCheckoutResponseSchema } from "./schema";
import { DonationService } from "./service";
import { StripeCheckoutClient } from "./stripe-client";

export function registerDonationsOpenApi(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "post",
    path: "/donations/checkout",
    description: "Create a Stripe Checkout session for a donation",
    summary: "Create donation checkout",
    request: {
      body: {
        content: {
          "application/json": {
            schema: donationCheckoutInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Checkout session created",
        content: {
          "application/json": {
            schema: donationCheckoutResponseSchema,
          },
        },
      },
      400: {
        description: "Validation failed",
        content: {
          "application/json": {
            schema: validationErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });
}

export function donationsRoutes(env: Env) {
  const repo = new DonationRepository(env.DB);
  const stripeClient = new StripeCheckoutClient(env.STRIPE_SECRET_KEY);
  const service = new DonationService(repo, stripeClient, {
    successUrl: env.STRIPE_SUCCESS_URL,
    cancelUrl: env.STRIPE_CANCEL_URL,
  });
  const controller = new DonationController(service);

  return {
    "POST /donations/checkout": (req: Request) => controller.createCheckout(req),
  };
}
