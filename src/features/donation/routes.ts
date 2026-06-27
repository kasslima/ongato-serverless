import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Env } from "../../shared/type";
import { validationErrorSchema, errorResponseSchema } from "../../shared/errors/schema";
import { DonationController } from "./controller";
import { DonationWebhookController } from "./webhook-controller";
import { DonationRepository } from "./repository";
import { donationCheckoutInputSchema, donationCheckoutResponseSchema } from "./schema";
import { DonationService } from "./service";
import { StripeCheckoutClient } from "./stripe-client";
import { StripeWebhookVerifier } from "./stripe-webhook";
import { DonationWebhookService } from "./webhook-service";
import { AwsSqsEmailQueuePublisher } from "./email-queue-publisher";

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

  registry.registerPath({
    method: "post",
    path: "/webhooks/stripe",
    description: "Receive Stripe webhook events",
    summary: "Stripe webhook",
    responses: {
      200: {
        description: "Webhook received",
      },
      400: {
        description: "Invalid Stripe signature",
        content: {
          "application/json": {
            schema: errorResponseSchema,
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
  const stripeWebhookVerifier = new StripeWebhookVerifier(env.STRIPE_WEBHOOK_SECRET);
  const emailQueuePublisher = new AwsSqsEmailQueuePublisher({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    sessionToken: env.AWS_SESSION_TOKEN,
    region: env.AWS_REGION,
    queueUrl: env.AWS_SQS_EMAIL_QUEUE_URL,
  });
  const webhookService = new DonationWebhookService(repo, stripeWebhookVerifier, emailQueuePublisher);
  const webhookController = new DonationWebhookController(webhookService);

  return {
    "POST /donations/checkout": (req: Request) => controller.createCheckout(req),
    "POST /webhooks/stripe": (req: Request) => webhookController.handleStripeWebhook(req),
  };
}
