import { IDonationRepository } from "./repository";
import { IEmailQueuePublisher } from "./email-queue-publisher";
import {
  IStripeWebhookVerifier,
  StripeCheckoutSession,
  StripePaymentIntent,
  StripeWebhookEvent,
} from "./stripe-webhook";

export interface IDonationWebhookService {
  handleStripeWebhook(rawBody: string, stripeSignature: string | null): Promise<void>;
}

export class DonationWebhookService implements IDonationWebhookService {
  constructor(
    private readonly repo: IDonationRepository,
    private readonly stripeWebhookVerifier: IStripeWebhookVerifier,
    private readonly emailQueuePublisher: IEmailQueuePublisher
  ) { }

  async handleStripeWebhook(rawBody: string, stripeSignature: string | null): Promise<void> {
    const event = await this.stripeWebhookVerifier.constructEvent(rawBody, stripeSignature);

    if (event.type === "checkout.session.completed") {
      await this.handleCheckoutSessionCompleted(event);
      return;
    }

    if (event.type === "checkout.session.expired") {
      await this.handleCheckoutSessionExpired(event);
      return;
    }

    if (event.type === "payment_intent.payment_failed") {
      await this.handlePaymentIntentFailed(event);
    }
  }

  private async handleCheckoutSessionCompleted(event: StripeWebhookEvent): Promise<void> {
    const session = event.data.object as StripeCheckoutSession;
    const donationId = this.parseDonationId(session.metadata?.donationId);

    if (!donationId) {
      return;
    }

    const donation = await this.repo.findById(donationId);
    if (!donation || donation.status !== "pending") {
      return;
    }

    const donorEmail = session.customer_details?.email ?? null;
    const paidDonation = await this.repo.markPaidIfPending({
      id: donation.id,
      donorEmail,
      paidAt: new Date().toISOString(),
      stripeSessionId: session.id,
    });

    if (!paidDonation || paidDonation.thankYouEmailQueuedAt) {
      return;
    }

    await this.emailQueuePublisher.publishDonationPaid({
      type: "donation_paid",
      donationId: String(paidDonation.id),
      donorEmail,
      amount: paidDonation.amount,
    });

    await this.repo.markThankYouEmailQueued(paidDonation.id, new Date().toISOString());
  }

  private async handleCheckoutSessionExpired(event: StripeWebhookEvent): Promise<void> {
    const session = event.data.object as StripeCheckoutSession;
    const donationId = this.parseDonationId(session.metadata?.donationId);

    if (!donationId) {
      return;
    }

    await this.repo.markExpiredIfPending(donationId);
  }

  private async handlePaymentIntentFailed(event: StripeWebhookEvent): Promise<void> {
    const paymentIntent = event.data.object as StripePaymentIntent;
    const donationId = this.parseDonationId(paymentIntent.metadata?.donationId);

    if (!donationId) {
      return;
    }

    await this.repo.markFailedIfPending(donationId);
  }

  private parseDonationId(value: string | undefined): number | null {
    if (!value) {
      return null;
    }

    const donationId = Number(value);
    if (!Number.isInteger(donationId) || donationId <= 0) {
      return null;
    }

    return donationId;
  }
}
