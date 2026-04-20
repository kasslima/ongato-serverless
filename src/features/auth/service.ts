import { generateToken } from "../../shared/auth/jwt";
import { passwordValid } from "../../shared/crypto/password";
import { UnauthorizedError } from "../../shared/errors/http-error";
import { IUserRepository } from "../users/repository";
import { Auth, TokenPayload } from "./schema";

export interface IAuthService {
  login(input: Auth): Promise<{ token: string }>;
}

export class AuthService implements IAuthService {
  constructor(private readonly repo: IUserRepository) { }

  async login(input: Auth): Promise<{ token: string }> {


    const user = await this.repo.findByEmail(input.email);
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const senhaOk = passwordValid(input.password, user.password);
    if (!senhaOk) throw new UnauthorizedError("Invalid credentials");


    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    } satisfies TokenPayload;

    const token = await generateToken(payload);
    return { token };
  }
}
