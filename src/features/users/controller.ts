import { apiResponse, handleError } from "../../shared/response/api-response";
import { validateBody } from "../../shared/validation/validation";
import { userCreateSchema } from "./schema";
import { IUserService } from "./service";

export class UserController {
    constructor(private readonly service: IUserService) {}

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
}
