import { apiResponse, createdResponse, handleError, noContentResponse } from "../../shared/response/api-response";
import { validateBody, validateParams } from "../../shared/validation/validation";
import { IBannerService } from "./service";
import { idParamSchema } from "../../shared/validation/schema";
import { bannerCreateApiSchema, bannerUpdateApiSchema } from "./schema";

export class BannerController {
  constructor(private readonly service: IBannerService) { }

  async getAll(_req: Request): Promise<Response> {
    try {
      const banners = await this.service.getAll();
      return apiResponse(banners, "banners retrieved successfully");
    } catch (error) {
      return handleError(error);
    }
  }

  async create(_req: Request): Promise<Response> {
    try {
      const contentType = _req.headers.get("content-type") || "";
      let input: any = {};
      let imageBuffer: ArrayBuffer | undefined;
      let fileName: string | undefined;
      let fileType: string | undefined;

      if (contentType.includes("multipart/form-data")) {
        const formData = await _req.formData();
        const imageFile = formData.get("image");
        if (imageFile && imageFile instanceof File) {
          imageBuffer = await imageFile.arrayBuffer();
          fileName = imageFile.name;
          fileType = imageFile.type;
        }

        for (const [key, value] of formData.entries()) {
          if (key !== "image") {
            input[key] = value;
          }
        }
      } else {
        input = await _req.json();
      }

      const validation = validateBody(input, bannerCreateApiSchema);

      if (!validation.success) {
        return createdResponse(validation.errors, "Validation failed");
      }

      const created = await this.service.create(validation.data, imageBuffer, fileName, fileType);
      return apiResponse(created, "Banner created successfully");
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
      let imageBuffer: ArrayBuffer | undefined;
      let fileName: string | undefined;
      let fileType: string | undefined;

      if (contentType.includes("multipart/form-data")) {
        const formData = await _req.formData();
        const imageFile = formData.get("image");
        if (imageFile && imageFile instanceof File) {
          imageBuffer = await imageFile.arrayBuffer();
          fileName = imageFile.name;
          fileType = imageFile.type;
        }

        for (const [key, value] of formData.entries()) {
          if (key !== "image") {
            inputBody[key] = value;
          }
        }
      } else {
        inputBody = await _req.json();
      }

      const validationBody = validateBody(inputBody, bannerUpdateApiSchema);

      if (!validationBody.success) {
        return apiResponse(validationBody.errors, "Validation failed");
      }

      const inputParams = { id: params.id ?? "" };
      const validationParams = validateParams(inputParams, idParamSchema);

      if (!validationParams.success) {
        return apiResponse(validationParams.errors, "Validation failed");
      }

      const created = await this.service.update(validationParams.data.id, validationBody.data, imageBuffer, fileName, fileType);
      return apiResponse(created, "Banner updated successfully");
    } catch (error) {
      return handleError(error);
    }
  }
}
