import { BadRequestError, InternalServerError } from "../../shared/errors/http-error";

export interface StripeCheckoutSession {
  id: string;
  metadata?: {
    donationId?: string;
  } | null;
  customer_details?: {
    email?: string | null;
  } | null;
  payment_intent?: string | null;
}

export interface StripePaymentIntent {
  id: string;
  metadata?: {
    donationId?: string;
  } | null;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSession | StripePaymentIntent | Record<string, unknown>;
  };
}

export interface IStripeWebhookVerifier {
  constructEvent(rawBody: string, stripeSignature: string | null): Promise<StripeWebhookEvent>;
}

export class StripeWebhookVerifier implements IStripeWebhookVerifier {
  private readonly toleranceInSeconds = 300;

  constructor(private readonly webhookSecret: string) { }

  async constructEvent(rawBody: string, stripeSignature: string | null): Promise<StripeWebhookEvent> {
    if (!this.webhookSecret) {
      throw new InternalServerError("Stripe webhook secret nao configurado");
    }

    if (!stripeSignature) {
      throw new BadRequestError("Stripe-Signature ausente");
    }

    const timestamp = this.getSignatureValue(stripeSignature, "t");
    const signatures = this.getSignatureValues(stripeSignature, "v1");

    if (!timestamp || signatures.length === 0) {
      throw new BadRequestError("Assinatura da Stripe invalida");
    }

    const timestampNumber = Number(timestamp);
    if (!Number.isFinite(timestampNumber)) {
      throw new BadRequestError("Timestamp da assinatura invalido");
    }

    const ageInSeconds = Math.abs(Date.now() / 1000 - timestampNumber);
    if (ageInSeconds > this.toleranceInSeconds) {
      throw new BadRequestError("Assinatura da Stripe expirada");
    }

    const expectedSignature = await this.computeSignature(`${timestamp}.${rawBody}`);
    const isValid = signatures.some((signature) => this.secureCompare(signature, expectedSignature));

    if (!isValid) {
      throw new BadRequestError("Assinatura da Stripe invalida");
    }

    try {
      return JSON.parse(rawBody) as StripeWebhookEvent;
    } catch {
      throw new BadRequestError("Payload da Stripe invalido");
    }
  }

  private getSignatureValue(header: string, key: string): string | null {
    return this.getSignatureValues(header, key)[0] ?? null;
  }

  private getSignatureValues(header: string, key: string): string[] {
    return header
      .split(",")
      .map((part) => part.trim().split("="))
      .filter(([partKey, partValue]) => partKey === key && Boolean(partValue))
      .map(([, partValue]) => partValue);
  }

  private async computeSignature(payload: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    return Array.from(new Uint8Array(signature))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i += 1) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}
