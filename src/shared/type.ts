export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
};

export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; errors: Record<string, string[]> }