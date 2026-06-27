import { z } from "zod";

export const donationStatusSchema = z.enum(["pending", "paid", "expired", "failed"]);
export const MIN_DONATION_AMOUNT_IN_CENTS = 1000;

export const donationSchema = z.object({
  id: z.number(),
  amount: z.number().int().positive(),
  status: donationStatusSchema,
  stripeSessionId: z.string().nullable(),
  donorEmail: z.string().nullable(),
  paidAt: z.string().nullable(),
  thankYouEmailQueuedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Donation = z.infer<typeof donationSchema>;

export const donationCreateSchema = donationSchema.omit({
  id: true,
  stripeSessionId: true,
  thankYouEmailQueuedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type DonationCreate = z.infer<typeof donationCreateSchema>;

export const donationCheckoutInputSchema = z
  .object({
    amount: z
      .number()
      .int()
      .min(
        MIN_DONATION_AMOUNT_IN_CENTS,
        "amount deve ser de no minimo 1000 centavos"
      ),
  })
  .strict();
export type DonationCheckoutInput = z.infer<typeof donationCheckoutInputSchema>;

export const donationCheckoutResponseSchema = z.object({
  checkoutUrl: z.string().url(),
});
export type DonationCheckoutResponse = z.infer<typeof donationCheckoutResponseSchema>;
