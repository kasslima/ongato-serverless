import { IBannerRepository } from "./repository";
import { Banner, BannerCreateApiInput, BannerUpdateApiInput } from "./schema";
import { IImageUploadRepository } from "../../shared/storage/image-upload.repository";


export interface IBannerService {
  getAll(): Promise<Banner[]>;
  getById(id: number): Promise<Banner | null>;
  create(input: BannerCreateApiInput, imageBuffer?: ArrayBuffer, fileName?: string, contentType?: string): Promise<Banner>;
  update(id: number, input: BannerUpdateApiInput, imageBuffer?: ArrayBuffer, fileName?: string, contentType?: string): Promise<Banner>;
  delete(id: number): Promise<void>;
}

export class BannerService implements IBannerService {
  constructor(
    private readonly repo: IBannerRepository,
    private readonly imageRepo: IImageUploadRepository
  ) { }

  async getAll(): Promise<Banner[]> {
    return await this.repo.getAll();
  }

  async getById(id: number): Promise<Banner | null> {
    return await this.repo.findById(id);
  }

  async create(input: BannerCreateApiInput, imageBuffer?: ArrayBuffer, fileName?: string, contentType?: string): Promise<Banner> {
    let imageUrl = "";
    if (imageBuffer && fileName && contentType) {
      imageUrl = await this.imageRepo.upload(imageBuffer, fileName, contentType);
    }
    
    return this.repo.create({
      ...input,
      imageUrl
    });
  }

  async update(id: number, input: BannerUpdateApiInput, imageBuffer?: ArrayBuffer, fileName?: string, contentType?: string): Promise<Banner> {

    const banner = await this.repo.findById(id);

    if (!banner) {
      throw new Error("Banner not found");
    }

    let newImageUrl = input.imageUrl;

    if (imageBuffer && fileName && contentType) {
      if (banner.imageUrl) {
        try {
          await this.imageRepo.delete(banner.imageUrl);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
      newImageUrl = await this.imageRepo.upload(imageBuffer, fileName, contentType);
    }

    return await this.repo.update(id, {
      ...input,
      ...(newImageUrl ? { imageUrl: newImageUrl } : {})
    });
  }

  async delete(id: number): Promise<void> {
    const banner = await this.repo.findById(id);
    if (banner && banner.imageUrl) {
      try {
        await this.imageRepo.delete(banner.imageUrl);
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }
    await this.repo.delete(id);
  }
}
