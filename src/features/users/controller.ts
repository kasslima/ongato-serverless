import { apiResponse, handleError } from "../../shared/response/api-response";
import { IUserService } from "./service";

export class UserController {
    constructor(private readonly service: IUserService) {}

  async getAll(_req: Request): Promise<Response> {
    try {
      const users = await this.service.getAll();

      return apiResponse(users, "users retrieved successfully");
    } catch (error) {
      const response = handleError(error);

      return Response.json(response.jsonBody ?? null, { status: response.status });
    }
  }
}