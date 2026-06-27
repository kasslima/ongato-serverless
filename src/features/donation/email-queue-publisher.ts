import { InternalServerError } from "../../shared/errors/http-error";

export interface DonationPaidEmailMessage {
  type: "donation_paid";
  donationId: string;
  donorEmail: string | null;
  amount: number;
}

export interface AwsSqsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region: string;
  queueUrl: string;
}

export interface IEmailQueuePublisher {
  publishDonationPaid(message: DonationPaidEmailMessage): Promise<void>;
}

export class AwsSqsEmailQueuePublisher implements IEmailQueuePublisher {
  private readonly service = "sqs";

  constructor(private readonly config: AwsSqsConfig) { }

  async publishDonationPaid(message: DonationPaidEmailMessage): Promise<void> {
    this.validateConfig();

    const queueUrl = new URL(this.config.queueUrl);
    const body = JSON.stringify({
      QueueUrl: this.config.queueUrl,
      MessageBody: JSON.stringify(message),
    });

    const now = new Date();
    const amzDate = this.formatAmzDate(now);
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = await this.sha256Hex(body);
    const canonicalHeadersItems = [
      `content-type:application/x-amz-json-1.0`,
      `host:${queueUrl.host}`,
      `x-amz-date:${amzDate}`,
      `x-amz-target:AmazonSQS.SendMessage`,
    ];
    const signedHeadersItems = ["content-type", "host", "x-amz-date", "x-amz-target"];

    if (this.config.sessionToken) {
      canonicalHeadersItems.push(`x-amz-security-token:${this.config.sessionToken}`);
      signedHeadersItems.push("x-amz-security-token");
    }

    canonicalHeadersItems.sort();
    signedHeadersItems.sort();

    const canonicalHeaders = `${canonicalHeadersItems.join("\n")}\n`;
    const signedHeaders = signedHeadersItems.join(";");
    const canonicalRequest = [
      "POST",
      queueUrl.pathname,
      queueUrl.searchParams.toString(),
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");
    const credentialScope = `${dateStamp}/${this.config.region}/${this.service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      await this.sha256Hex(canonicalRequest),
    ].join("\n");
    const signingKey = await this.getSignatureKey(dateStamp);
    const signature = await this.hmacHex(signingKey, stringToSign);
    const authorization = [
      `AWS4-HMAC-SHA256 Credential=${this.config.accessKeyId}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(", ");

    const headers: Record<string, string> = {
      Authorization: authorization,
      "Content-Type": "application/x-amz-json-1.0",
      "X-Amz-Date": amzDate,
      "X-Amz-Target": "AmazonSQS.SendMessage",
    };

    if (this.config.sessionToken) {
      headers["X-Amz-Security-Token"] = this.config.sessionToken;
    }

    const response = await fetch(this.config.queueUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new InternalServerError(`Falha ao publicar evento no SQS: ${errorBody}`);
    }
  }

  private validateConfig(): void {
    if (
      !this.config.accessKeyId ||
      !this.config.secretAccessKey ||
      !this.config.region ||
      !this.config.queueUrl
    ) {
      throw new InternalServerError("Configuracao AWS SQS incompleta");
    }
  }

  private formatAmzDate(date: Date): string {
    return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  }

  private async sha256Hex(value: string): Promise<string> {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return this.toHex(hash);
  }

  private async hmac(key: ArrayBuffer | Uint8Array, value: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(value));
  }

  private async hmacHex(key: ArrayBuffer | Uint8Array, value: string): Promise<string> {
    return this.toHex(await this.hmac(key, value));
  }

  private async getSignatureKey(dateStamp: string): Promise<ArrayBuffer> {
    const dateKey = await this.hmac(new TextEncoder().encode(`AWS4${this.config.secretAccessKey}`), dateStamp);
    const regionKey = await this.hmac(dateKey, this.config.region);
    const serviceKey = await this.hmac(regionKey, this.service);
    return this.hmac(serviceKey, "aws4_request");
  }

  private toHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }
}
