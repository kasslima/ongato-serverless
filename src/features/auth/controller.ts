import { apiResponse, handleError } from "../../shared/response/api-response";
import { validateBody } from "../../shared/validation/validation";
import { authSchema } from "./schema";
import { IAuthService } from "./service";

export class AuthController {
  constructor(private readonly service: IAuthService) { }

  async login(_req: Request): Promise<Response> {
    try {
      const input = await _req.json();
      const validation = validateBody(input, authSchema);

      if (!validation.success) {
        return apiResponse(validation.errors, "Validation failed");
      }

      const created = await this.service.login(validation.data);
      return apiResponse(created, "Auth successfully");
    } catch (error) {
      return handleError(error);
    }
  }
}
