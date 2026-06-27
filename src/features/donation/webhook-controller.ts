import { handleError } from "../../shared/response/api-response";
import { IDonationWebhookService } from "./webhook-service";

export class DonationWebhookController {
  constructor(private readonly service: IDonationWebhookService) { }

  async handleStripeWebhook(req: Request): Promise<Response> {
    try {
      const rawBody = await req.text();
      const stripeSignature = req.headers.get("Stripe-Signature");

      await this.service.handleStripeWebhook(rawBody, stripeSignature);
      return Response.json({ received: true });
    } catch (error) {
      return handleError(error);
    }
  }
}
