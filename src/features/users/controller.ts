import { UserService } from "./service";

export class UserController {
    constructor(private service: UserService) {}

  async getAll(req: Request): Promise<Response> {
    
    return new Response("Login successful");
  }

}