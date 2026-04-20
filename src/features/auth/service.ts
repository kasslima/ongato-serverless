import { hashPassword, passwordValid } from "../../shared/crypto/password";
import { IUserRepository } from "../users/repository";
import { Auth, TokenPayload } from "./schema";

export interface IAuthService {
  login(input: Auth): Promise<TokenPayload>;
}

export class AuthService implements IAuthService {
  constructor(private readonly repo: IUserRepository) { }

  async login(input: Auth): Promise<TokenPayload> {


    const user = await this.repo.findByEmail(input.email);
    if (!user) throw new Error("Invalid credentials");

    const senhaOk = passwordValid(input.password, user.password);
    if (!senhaOk) throw new Error("Invalid credentials");


    return {
      id: user.id,
      email: user.email,
      role: user.role
    } satisfies TokenPayload;
    
  }
}