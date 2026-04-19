import { apiResponse, handleError } from "../../shared/response/api-response";
import { IUserService } from "./service";

export class UserController {
    constructor(private readonly service: IUserService) {}

  async getAll(_req: Request): Promise<Response> {
    try {
      const users = await this.service.getAll();
      const response = apiResponse(users, "users retrieved successfully");

      return Response.json(response.jsonBody ?? null, { status: response.status });
    } catch (error) {
      const response = handleError(error);
      console.log("Error in getAll:", error);

      return Response.json(response.jsonBody ?? null, { status: response.status });
    }
  }
}
