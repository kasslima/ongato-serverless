import { errorResponse, handleError } from "../../shared/response/api-response";
import { BadRequestError } from "../../shared/errors/http-error";
import { validateBody } from "../../shared/validation/validation";
import { donationCheckoutInputSchema } from "./schema";
import { IDonationService } from "./service";

export class DonationController {
  constructor(private readonly service: IDonationService) { }

  async createCheckout(req: Request): Promise<Response> {
    try {
      const body = await req.json().catch(() => {
        throw new BadRequestError("JSON invalido");
      });
      const validation = validateBody(body, donationCheckoutInputSchema);

      if (!validation.success) {
        return errorResponse(400, validation.errors);
      }

      const result = await this.service.createCheckout(validation.data);
      return Response.json(result);
    } catch (error) {
      return handleError(error);
    }
  }
}
