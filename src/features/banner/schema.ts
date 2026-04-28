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
export type BannerCreateInput = z.infer<typeof bannerCreateSchema>;

export const bannerCreateApiSchema = bannerCreateSchema.omit({
  imageUrl: true
});
export type BannerCreateApiInput = z.infer<typeof bannerCreateApiSchema>;

export const bannerUpdateSchema = bannerSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser enviado para atualização"
  });
export type BannerUpdateInput = z.infer<typeof bannerUpdateSchema>;

export const bannerUpdateApiSchema = bannerUpdateSchema
  .omit({
    imageUrl: true
  })
  .strict();
export type BannerUpdateApiInput = z.infer<typeof bannerUpdateApiSchema>;
