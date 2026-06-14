import { IAnimalRepository } from "./repository";
import { Animal, AnimalCreateInput, AnimalQuery, AnimalUpdateInput } from "./schema";
import { IImageUploadRepository } from "../../shared/storage/image-storage";
import { MultipartFile } from "../../shared/type";
import { BadRequestError } from "../../shared/errors/http-error";

const MAX_FEATURED_ANIMALS = 4;


export interface IAnimalService {
  getAll(query: AnimalQuery): Promise<Animal[]>;
  getById(id: number): Promise<Animal | null>;
  create(input: AnimalCreateInput, file?: MultipartFile): Promise<Animal>;
  update(id: number, input: AnimalUpdateInput, file?: MultipartFile): Promise<Animal>;
  delete(id: number): Promise<void>;
}

export class AnimalService implements IAnimalService {
  constructor(
    private readonly repo: IAnimalRepository,
    private readonly imageRepo: IImageUploadRepository
  ) { }

  private async ensureFeaturedLimit(featured: boolean, excludeId?: number): Promise<void> {
    if (!featured) {
      return;
    }

    const featuredAnimals = await this.repo.countFeaturedAnimals(excludeId);
    if (featuredAnimals >= MAX_FEATURED_ANIMALS) {
      throw new BadRequestError(`Apenas ${MAX_FEATURED_ANIMALS} animais podem estar em destaque`);
    }
  }

  async getAll(query: AnimalQuery): Promise<Animal[]> {
    return await this.repo.getAll(query);
  }

  async getById(id: number): Promise<Animal | null> {
    return await this.repo.findById(id);
  }

  async create(input: AnimalCreateInput, file?: MultipartFile): Promise<Animal> {
    if (!file) {
      throw new Error("Image file is required for animal creation");
    }

    await this.ensureFeaturedLimit(input.featured);

    const imageUrl = await this.imageRepo.upload(file.imageBuffer, file.fileName, file.fileType);

    return this.repo.create({
      ...input,
      imageUrl
    });
  }

  async update(id: number, input: AnimalUpdateInput, file?: MultipartFile): Promise<Animal> {

    const animal = await this.repo.findById(id);

    if (!animal) {
      throw new Error("Animal not found");
    }

    await this.ensureFeaturedLimit(input.featured ?? animal.featured, id);

    const updatePayload: Record<string, unknown> = {
      ...input
    };

    if (file) {
      if (animal.imageUrl) {
        try {
          await this.imageRepo.delete(animal.imageUrl);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
      updatePayload.imageUrl = await this.imageRepo.upload(file.imageBuffer, file.fileName, file.fileType);
    }

    return await this.repo.update(id, updatePayload as AnimalUpdateInput & { imageUrl?: string });
  }

  async delete(id: number): Promise<void> {
    const animal = await this.repo.findById(id);
    if (animal && animal.imageUrl) {
      try {
        await this.imageRepo.delete(animal.imageUrl);
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }
    await this.repo.delete(id);
  }
}
