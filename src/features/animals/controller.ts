import { apiResponse, createdResponse, handleError, noContentResponse } from "../../shared/response/api-response";
import { parseMultipartFormData, validateBody, validateMultipartImage, validateParams, validateQuery } from "../../shared/validation/validation";
import { IAnimalService } from "./service";
import { idParamSchema } from "../../shared/validation/schema";
import { animalCreateInputSchema, animalQuerySchema, animalUpdateInputSchema } from "./schema";

export class AnimalController {
  constructor(private readonly service: IAnimalService) { }

  async getAll(_req: Request): Promise<Response> {
    try {
      const query = validateQuery(new URL(_req.url).searchParams, animalQuerySchema);
      if (!query.success) {
        return apiResponse(query.errors, "Validation failed");
      }

      const animals = await this.service.getAll(query.data);
      return apiResponse(animals, "animals retrieved successfully");
    } catch (error) {
      return handleError(error);
    }
  }

  async create(_req: Request): Promise<Response> {
    try {
      const multipart = await validateMultipartImage(_req);
      if (!multipart.success) {
        return apiResponse(multipart.errors ?? {}, "Create animal requires multipart/form-data with image");
      }

      const validation = validateBody(multipart.body ?? {}, animalCreateInputSchema);
      if (!validation.success) {
        return createdResponse(validation.errors, "Validation failed");
      }

      const created = await this.service.create(validation.data, multipart.file);
      return apiResponse(created, "Animal created successfully");
    } catch (error) {
      return handleError(error);
    }
  }

  async delete(_req: Request, params: Record<string, string>): Promise<Response> {
    try {
      const input = { id: params.id ?? "" };
      const validation = validateParams(input, idParamSchema);

      if (!validation.success) {
        return apiResponse(validation.errors, "Validation failed");
      }

      await this.service.delete(validation.data.id);
      return noContentResponse();
    } catch (error) {
      return handleError(error);
    }
  }

  async update(_req: Request, params: Record<string, string>): Promise<Response> {
    try {
      const contentType = _req.headers.get("content-type") || "";
      let inputBody: any = {};
      let file = undefined;

      if (contentType.includes("multipart/form-data")) {
        const multipart = await parseMultipartFormData(_req);
        if (!multipart.success) {
          return apiResponse(multipart.errors ?? {}, "Invalid multipart/form-data");
        }

        inputBody = multipart.body ?? {};
        file = multipart.file;
      } else {
        inputBody = await _req.json();
      }

      const validationBody = validateBody(inputBody, animalUpdateInputSchema);

      if (!validationBody.success) {
        return apiResponse(validationBody.errors, "Validation failed");
      }

      const inputParams = { id: params.id ?? "" };
      const validationParams = validateParams(inputParams, idParamSchema);

      if (!validationParams.success) {
        return apiResponse(validationParams.errors, "Validation failed");
      }

      const updated = await this.service.update(validationParams.data.id, validationBody.data, file);
      return apiResponse(updated, "Animal updated successfully");
    } catch (error) {
      return handleError(error);
    }
  }
}
