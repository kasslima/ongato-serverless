import { InternalServerError } from "../../shared/errors/http-error";

export interface CreateCheckoutSessionInput {
  amount: number;
  donationId: number;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface IStripeCheckoutClient {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession>;
}

export class StripeCheckoutClient implements IStripeCheckoutClient {
  private readonly baseUrl = "https://api.stripe.com/v1";

  constructor(private readonly secretKey: string) { }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession> {
    if (!this.secretKey) {
      throw new InternalServerError("Stripe secret key nao configurada");
    }

    const body = new URLSearchParams({
      mode: "payment",
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "brl",
      "line_items[0][price_data][unit_amount]": String(input.amount),
      "line_items[0][price_data][product_data][name]": "Doação para ONG",
      "metadata[donationId]": String(input.donationId),
      "payment_intent_data[metadata][donationId]": String(input.donationId),
    });

    const response = await fetch(`${this.baseUrl}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await response.json().catch(() => null) as {
      id?: string;
      url?: string | null;
      error?: { message?: string };
    } | null;

    if (!response.ok) {
      throw new InternalServerError(data?.error?.message ?? "Falha ao criar sessao de checkout");
    }

    if (!data?.id || !data.url) {
      throw new InternalServerError("Resposta invalida da Stripe");
    }

    return {
      id: data.id,
      url: data.url,
    };
  }
}
