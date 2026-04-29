import { z } from "zod";

export const bannerSchema = z.object({
  id: z.number(),
  title: z.string(),
  imageUrl: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().nullable()
});
export type Banner = z.infer<typeof bannerSchema>;


export const bannerCreateSchema = bannerSchema.omit({
  id: true,
  createdAt: true
});
export type BannerCreate = z.infer<typeof bannerCreateSchema>;

export const bannerCreateInputSchema = bannerCreateSchema.omit({
  imageUrl: true
});
export type BannerCreateInput = z.infer<typeof bannerCreateInputSchema>;


export const bannerUpdateSchema = bannerSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser enviado para atualização"
  });
export type BannerUpdate = z.infer<typeof bannerUpdateSchema>;

export const bannerUpdateInputSchema = bannerSchema
  .omit({
    id: true,
    createdAt: true,
    imageUrl: true
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser enviado para atualização"
  })
  .strict();
export type BannerUpdateInput = z.infer<typeof bannerUpdateInputSchema>;
