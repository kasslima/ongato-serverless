import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { donations } from "../../db/schema";
import { Donation, DonationCreate } from "./schema";

export interface IDonationRepository {
  create(input: DonationCreate): Promise<Donation>;
  updateStripeSessionId(id: number, stripeSessionId: string): Promise<Donation>;
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
}
