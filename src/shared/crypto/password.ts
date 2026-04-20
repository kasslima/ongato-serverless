import bcrypt from "bcryptjs";

export function hashPassword(senha: string): string {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(senha, salt);
  return hash;
}

export function passwordValid(senha: string, hash: string): boolean {
  return bcrypt.compareSync(senha, hash);
}