import { HttpError } from "../errors/http-error";

export interface ApiResponse<T> {
  result: T;
  message: string;
}

function json(status: number, body: unknown): Response {
  return Response.json(body, { status });
}

export function apiResponse<T>(data: T, message: string): Response {
  return json(200, {
    result: data,
    message,
  });
}

export function createdResponse<T = unknown>(data: T, message: string): Response {
  return json(201, {
    result: data,
    message,
  });
}

export function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

export function errorResponse(status: number, errors: unknown): Response {
  return json(status, {
    message: "Dados invalidos",
    errors,
  });
}

function isUniqueConstraintError(errorMessage: string): boolean {
  const msg = errorMessage.toLowerCase();
  return msg.includes("unique") || msg.includes("constraint failed");
}

export function handleError(error: unknown): Response {
  console.error(error);

  if (error instanceof HttpError) {
    return json(error.statusCode, {
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    });
  }

  if (error instanceof Error && isUniqueConstraintError(error.message)) {
    return json(409, {
      message: "Conflito de dados: registro ja existente",
    });
  }

  return json(500, {
    message: "Erro interno do servidor",
  });
}
