import { BadRequestError, InternalServerError } from "../../shared/errors/http-error";
import { IDonationRepository } from "./repository";
import { DonationCheckoutInput, DonationCheckoutResponse, MIN_DONATION_AMOUNT_IN_CENTS } from "./schema";
import { IStripeCheckoutClient } from "./stripe-client";

export interface DonationCheckoutConfig {
  successUrl: string;
  cancelUrl: string;
}

export interface IDonationService {
  createCheckout(input: DonationCheckoutInput): Promise<DonationCheckoutResponse>;
}

export class DonationService implements IDonationService {
  constructor(
    private readonly repo: IDonationRepository,
    private readonly stripeClient: IStripeCheckoutClient,
    private readonly config: DonationCheckoutConfig
  ) { }

  async createCheckout(input: DonationCheckoutInput): Promise<DonationCheckoutResponse> {
    if (input.amount < MIN_DONATION_AMOUNT_IN_CENTS) {
      throw new BadRequestError("amount deve ser de no minimo 1000 centavos");
    }

    if (!this.config.successUrl || !this.config.cancelUrl) {
      throw new InternalServerError("URLs de checkout nao configuradas");
    }

    const donation = await this.repo.create({
      amount: input.amount,
      status: "pending",
      donorEmail: null,
      paidAt: null,
    });

    const session = await this.stripeClient.createCheckoutSession({
      amount: input.amount,
      donationId: donation.id,
      successUrl: this.config.successUrl,
      cancelUrl: this.config.cancelUrl,
    });

    await this.repo.updateStripeSessionId(donation.id, session.id);

    return {
      checkoutUrl: session.url,
    };
  }
}
