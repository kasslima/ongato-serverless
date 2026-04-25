import { hashPassword } from "../../shared/crypto/password";
import { IBannerRepository } from "./repository";
import { Banner, BannerCreateInput, BannerUpdateInput } from "./schema";

export interface IBannerService {
  getAll(): Promise<Banner[]>;
  getById(id: number): Promise<Banner | null>;
  create(input: BannerCreateInput): Promise<Banner>;
  update(id: number, input: BannerUpdateInput): Promise<Banner>;
  delete(id: number): Promise<void>;
}

export class BannerService implements IBannerService {
  constructor(private readonly repo: IBannerRepository) { }

  async getAll(): Promise<Banner[]> {
    return await this.repo.getAll();
  }

  async getById(id: number): Promise<Banner | null> {
    return await this.repo.findById(id);
  }

  async create(input: BannerCreateInput): Promise<Banner> {

    return this.repo.create(input);
  }

  async update(id: number, input: BannerUpdateInput): Promise<Banner> {
    const banner = await this.repo.findById(id);

    if (!banner) {
      throw new Error("Banner not found");
    }

    return await this.repo.update(id, input);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
