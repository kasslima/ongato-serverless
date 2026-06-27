import { and, eq, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { donations } from "../../db/schema";
import { Donation, DonationCreate } from "./schema";

export interface IDonationRepository {
  create(input: DonationCreate): Promise<Donation>;
  findById(id: number): Promise<Donation | null>;
  updateStripeSessionId(id: number, stripeSessionId: string): Promise<Donation>;
  markPaidIfPending(input: {
    id: number;
    donorEmail: string | null;
    paidAt: string;
    stripeSessionId: string;
  }): Promise<Donation | null>;
  markExpiredIfPending(id: number): Promise<Donation | null>;
  markFailedIfPending(id: number): Promise<Donation | null>;
  markThankYouEmailQueued(id: number, queuedAt: string): Promise<Donation | null>;
}

export class DonationRepository implements IDonationRepository {
  private orm;

  constructor(private readonly db: D1Database) {
    this.orm = drizzle(this.db);
  }

  async create(input: DonationCreate): Promise<Donation> {
    const rows = await this.orm
      .insert(donations)
      .values(input)
      .returning();

    if (rows.length === 0) {
      throw new Error("Falha ao criar doacao");
    }

    return rows[0];
  }

  async findById(id: number): Promise<Donation | null> {
    const rows = await this.orm
      .select()
      .from(donations)
      .where(eq(donations.id, id))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  async updateStripeSessionId(id: number, stripeSessionId: string): Promise<Donation> {
    const rows = await this.orm
      .update(donations)
      .set({
        stripeSessionId,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(donations.id, id))
      .returning();

    if (rows.length === 0) {
      throw new Error("Falha ao atualizar sessao da doacao");
    }

    return rows[0];
  }

  async markPaidIfPending(input: {
    id: number;
    donorEmail: string | null;
    paidAt: string;
    stripeSessionId: string;
  }): Promise<Donation | null> {
    const rows = await this.orm
      .update(donations)
      .set({
        status: "paid",
        donorEmail: input.donorEmail,
        paidAt: input.paidAt,
        stripeSessionId: input.stripeSessionId,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(
        and(
          eq(donations.id, input.id),
          eq(donations.status, "pending")
        )
      )
      .returning();

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  async markExpiredIfPending(id: number): Promise<Donation | null> {
    const rows = await this.orm
      .update(donations)
      .set({
        status: "expired",
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(
        and(
          eq(donations.id, id),
          eq(donations.status, "pending")
        )
      )
      .returning();

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  async markFailedIfPending(id: number): Promise<Donation | null> {
    const rows = await this.orm
      .update(donations)
      .set({
        status: "failed",
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(
        and(
          eq(donations.id, id),
          eq(donations.status, "pending")
        )
      )
      .returning();

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  async markThankYouEmailQueued(id: number, queuedAt: string): Promise<Donation | null> {
    const rows = await this.orm
      .update(donations)
      .set({
        thankYouEmailQueuedAt: queuedAt,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(
        and(
          eq(donations.id, id),
          isNull(donations.thankYouEmailQueuedAt)
        )
      )
      .returning();

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }
}
