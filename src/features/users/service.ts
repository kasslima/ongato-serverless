import { IUserRepository } from "./repository";
import { User } from "./schema";

export interface IUserService {
  getAll(): Promise<User[]>;
}

export class UserService implements IUserService {
    constructor(private readonly repo: IUserRepository) {}

  async getAll(): Promise<User[]> {
    return this.repo.getAll();
  }
}