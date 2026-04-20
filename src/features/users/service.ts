import { hashPassword } from "../../shared/crypto/password";
import { IUserRepository } from "./repository";
import { User, UserCreateInput } from "./schema";

export interface IUserService {
  getAll(): Promise<User[]>;
  create(input: UserCreateInput): Promise<User>;
  delete(id: number): Promise<void>;
}

export class UserService implements IUserService {
  constructor(private readonly repo: IUserRepository) { }

  async getAll(): Promise<User[]> {
    return await this.repo.getAll();
  }

  async create(input: UserCreateInput): Promise<User> {
    const hashedPassword = hashPassword(input.password);

    return this.repo.create({
      ...input,
      password: hashedPassword,
    });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
