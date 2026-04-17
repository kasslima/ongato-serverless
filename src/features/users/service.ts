import { User } from "./schema";

export class UserService {
    constructor(private repo: UserRepository) {}

  async getAll(): Promise<User[]> {
    return this.repo.getAll();
  }
}