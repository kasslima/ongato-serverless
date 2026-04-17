export class HttpError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string
    ) {
        super(message)
        this.name = "HttpError"
    }
}

export class NotFoundError extends HttpError {
    constructor(message = "Recurso não encontrado") {
        super(404, message)
        this.name = "NotFoundError"
    }
}

export class BadRequestError extends HttpError {
    constructor(message = "Requisição inválida") {
        super(400, message)
        this.name = "BadRequestError"
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = "Não autorizado") {
        super(401, message)
        this.name = "UnauthorizedError"
    }
}

export class InternalServerError extends HttpError {
    constructor(message = "Erro interno do servidor") {
        super(500, message)
        this.name = "InternalServerError"
    }
}
