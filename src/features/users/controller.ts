import { apiResponse, handleError, noContentResponse } from "../../shared/response/api-response";
import { validateBody, validateParams } from "../../shared/validation/validation";
import { userCreateSchema } from "./schema";
import { IUserService } from "./service";
import { idParamSchema } from "../../shared/validation/schema";
import { no } from "zod/locales";

export class UserController {
  constructor(private readonly service: IUserService) { }

  async getAll(_req: Request): Promise<Response> {
    try {
      const users = await this.service.getAll();
      return apiResponse(users, "users retrieved successfully");
    } catch (error) {
      return handleError(error);
    }
  }

  async create(_req: Request): Promise<Response> {
    try {
      const input = await _req.json();
      const validation = validateBody(input, userCreateSchema);

      if (!validation.success) {
        return apiResponse(validation.errors, "Validation failed");
      }

      const created = await this.service.create(validation.data);
      return apiResponse(created, "User created successfully");
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
}
