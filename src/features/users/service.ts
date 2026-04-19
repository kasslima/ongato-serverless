import { IUserRepository } from "./repository";
import { User, UserCreateInput } from "./schema";

export interface IUserService {
  getAll(): Promise<User[]>;
  create(input: UserCreateInput): Promise<User>;
}

export class UserService implements IUserService {
    constructor(private readonly repo: IUserRepository) {}

  async getAll(): Promise<User[]> {
    return await this.repo.getAll();
  }

  async create(input: UserCreateInput): Promise<User> {
    return await this.repo.create(input);
  }
}