import { IBannerRepository } from "./repository";
import { Banner, BannerCreateInput, BannerUpdateInput } from "./schema";
import { IImageUploadRepository } from "../../shared/storage/image-storage";
import { MultipartFile } from "../../shared/type";


export interface IBannerService {
  getAll(): Promise<Banner[]>;
  getById(id: number): Promise<Banner | null>;
  create(input: BannerCreateInput, file?: MultipartFile): Promise<Banner>;
  update(id: number, input: BannerUpdateInput, file?: MultipartFile): Promise<Banner>;
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

  async create(input: BannerCreateInput, file?: MultipartFile): Promise<Banner> {
    if (!file) {
      throw new Error("Image file is required for banner creation");
    }

    const imageUrl = await this.imageRepo.upload(file.imageBuffer, file.fileName, file.fileType);

    return this.repo.create({
      ...input,
      imageUrl
    });
  }

  async update(id: number, input: BannerUpdateInput, file?: MultipartFile): Promise<Banner> {

    const banner = await this.repo.findById(id);

    if (!banner) {
      throw new Error("Banner not found");
    }

    const updatePayload: Record<string, unknown> = {
      ...input
    };

    if (file) {
      if (banner.imageUrl) {
        try {
          await this.imageRepo.delete(banner.imageUrl);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
      updatePayload.imageUrl = await this.imageRepo.upload(file.imageBuffer, file.fileName, file.fileType);
    }

    return await this.repo.update(id, updatePayload as BannerUpdateInput & { imageUrl?: string });
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
