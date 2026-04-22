import { hashPassword } from "../../shared/crypto/password";
import { IUserRepository } from "./repository";
import { User, UserCreateInput, UserResponse } from "./schema";

export interface IUserService {
  getAll(): Promise<UserResponse[]>;
  create(input: UserCreateInput): Promise<UserResponse>;
  delete(id: number): Promise<void>;
}

export class UserService implements IUserService {
  constructor(private readonly repo: IUserRepository) { }

  async getAll(): Promise<UserResponse[]> {
    return await this.repo.getAll();
  }

  async create(input: UserCreateInput): Promise<UserResponse> {
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
