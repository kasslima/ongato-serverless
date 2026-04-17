import { HttpError } from "../errors/http-error"

export interface ApiResponse<T> {
    result: T
    message: string
}

export function apiResponse<T>(data: T, message: string): HttpResponseInit {
    return {
        status: 200,
        jsonBody: {
            result: data,
            message
        }
    }
}

export function createdResponse<T = unknown>(data: T, message: string): HttpResponseInit {
    return {
        status: 201,
        jsonBody: {
            result: data,
            message
        }
    }
}


export function noContentResponse(): HttpResponseInit {
    return {
        status: 204
    }
}

export function errorResponse(status: number, errors: unknown): HttpResponseInit {
  return {
    status,
    jsonBody: {
      message: "Dados inválidos",
      errors
    }
  }
}

export function handleError(error: unknown): HttpResponseInit {
    console.log(error)
    if (error instanceof HttpError) {
        return {
            status: error.statusCode,
            jsonBody: { message: error.message }
        }
    }

    return {
        status: 500,
        jsonBody: { message: "Erro interno do servidor" }
    }
}

