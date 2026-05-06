import { IEventRepository } from "./repository";
import { Event, EventCreateInput, EventQuery, EventUpdateInput } from "./schema";
import { IImageUploadRepository } from "../../shared/storage/image-storage";
import { MultipartFile } from "../../shared/type";


export interface IEventService {
  getAll(query: EventQuery): Promise<Event[]>;
  getById(id: number): Promise<Event | null>;
  create(input: EventCreateInput, file?: MultipartFile): Promise<Event>;
  update(id: number, input: EventUpdateInput, file?: MultipartFile): Promise<Event>;
  delete(id: number): Promise<void>;
}

export class EventService implements IEventService {
  constructor(
    private readonly repo: IEventRepository,
    private readonly imageRepo: IImageUploadRepository
  ) { }

  async getAll(query: EventQuery): Promise<Event[]> {
    return await this.repo.getAll(query);
  }

  async getById(id: number): Promise<Event | null> {
    return await this.repo.findById(id);
  }

  async create(input: EventCreateInput, file?: MultipartFile): Promise<Event> {
    if (!file) {
      throw new Error("Image file is required for event creation");
    }

    const imageUrl = await this.imageRepo.upload(file.imageBuffer, file.fileName, file.fileType);

    return this.repo.create({
      ...input,
      imageUrl
    });
  }

  async update(id: number, input: EventUpdateInput, file?: MultipartFile): Promise<Event> {

    const event = await this.repo.findById(id);

    if (!event) {
      throw new Error("Event not found");
    }

    const updatePayload: Record<string, unknown> = {
      ...input
    };

    if (file) {
      if (event.imageUrl) {
        try {
          await this.imageRepo.delete(event.imageUrl);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
      updatePayload.imageUrl = await this.imageRepo.upload(file.imageBuffer, file.fileName, file.fileType);
    }

    return await this.repo.update(id, updatePayload as EventUpdateInput & { imageUrl?: string });
  }

  async delete(id: number): Promise<void> {
    const event = await this.repo.findById(id);
    if (event && event.imageUrl) {
      try {
        await this.imageRepo.delete(event.imageUrl);
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }
    await this.repo.delete(id);
  }
}
