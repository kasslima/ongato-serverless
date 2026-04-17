import { ZodSchema } from "zod"
import { ValidationResult } from "../type"

export function validateBody<T>(body: unknown, schema: ZodSchema<T>): ValidationResult<T> {
    const result = schema.safeParse(body)

    if (!result.success) {
        const flattened = result.error.flatten()

        return {
            success: false,
            errors: {
                ...flattened.fieldErrors,
                ...(flattened.formErrors.length > 0 && { _form: flattened.formErrors })
            }
        }
    }

    return { success: true, data: result.data }
}


export function validateParams<T>(params: Record<string, string>, schema: ZodSchema<T>): ValidationResult<T> {
    const result = schema.safeParse(params)
    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors as Record<string, string[]>
        }
    }
    return { success: true, data: result.data }
}

export function validateQuery<T>(query: URLSearchParams, schema: ZodSchema<T>): ValidationResult<T> {
    const queryObject: Record<string, string> = {}
    query.forEach((value, key) => {
        queryObject[key] = value
    })

    const result = schema.safeParse(queryObject)
    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors as Record<string, string[]>
        }
    }
    return { success: true, data: result.data }
}