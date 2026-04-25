import { hashPassword } from "../../shared/crypto/password";
import { IUserRepository } from "./repository";
import { User, UserCreateInput, UserResponse, UserUpdateInput } from "./schema";

export interface IUserService {
  getAll(): Promise<UserResponse[]>;
  getById(id: number): Promise<UserResponse | null>;
  create(input: UserCreateInput): Promise<UserResponse>;
  update(id: number, input: UserUpdateInput): Promise<UserResponse>;
  delete(id: number): Promise<void>;
}

export class UserService implements IUserService {
  constructor(private readonly repo: IUserRepository) { }

  async getAll(): Promise<UserResponse[]> {
    return await this.repo.getAll();
  }

  async getById(id: number): Promise<UserResponse | null> {
    return await this.repo.findById(id);
  }

  async create(input: UserCreateInput): Promise<UserResponse> {
    const hashedPassword = hashPassword(input.password);

    return this.repo.create({
      ...input,
      password: hashedPassword,
    });
  }

  async update(id: number, input: UserUpdateInput): Promise<UserResponse> {
    const user = await this.repo.findById(id);

    if (!user) {
      throw new Error("User not found");
    }


    if (input.password) {
      input.password = hashPassword(input.password);
    }

    return await this.repo.update(id, {
      ...input,
      ...(input.password && { password: hashPassword(input.password) })
    });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
