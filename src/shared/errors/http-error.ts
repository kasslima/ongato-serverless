export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Recurso nao encontrado", details?: unknown) {
    super(404, message, details);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Requisicao invalida", details?: unknown) {
    super(400, message, details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Nao autorizado", details?: unknown) {
    super(401, message, details);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflito de dados", details?: unknown) {
    super(409, message, details);
    this.name = "ConflictError";
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Erro interno do servidor", details?: unknown) {
    super(500, message, details);
    this.name = "InternalServerError";
  }
}
