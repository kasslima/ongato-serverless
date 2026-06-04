import { ZodSchema } from "zod"
import { ValidationResult, MultipartFile } from "../type"

export interface MultipartFormDataResult {
  success: boolean
  body?: Record<string, unknown>
  file?: MultipartFile
  errors?: Record<string, string[]>
}

export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp'
]

export async function parseMultipartFormData(req: Request, imageField = "image"): Promise<MultipartFormDataResult> {
  const contentType = req.headers.get("content-type") || ""

  if (!contentType.includes("multipart/form-data")) {
    return {
      success: false,
      errors: { contentType: ["multipart/form-data is required"] }
    }
  }

  const formData = await req.formData()
  const body: Record<string, unknown> = {}
  let file: MultipartFile | undefined

  const imageFile = formData.get(imageField)
  if (imageFile && imageFile instanceof File) {
    file = {
      imageBuffer: await imageFile.arrayBuffer(),
      fileName: imageFile.name,
      fileType: imageFile.type,
    }
  }

  for (const [key, value] of formData.entries()) {
    if (key === imageField) continue
    body[key] = value instanceof File ? value : value
  }

  return {
    success: true,
    body,
    file,
  }
}

export async function validateMultipartImage(
  req: Request,
  imageField = "image",
  allowedTypes = DEFAULT_ALLOWED_IMAGE_TYPES
): Promise<MultipartFormDataResult> {
  const parsed = await parseMultipartFormData(req, imageField)

  if (!parsed.success) {
    return parsed
  }

  if (!parsed.file) {
    return {
      success: false,
      errors: { [imageField]: ["Image file is required"] }
    }
  }

  // Validate file type
  if (!allowedTypes.includes(parsed.file.fileType)) {
    const typesList = allowedTypes.join(', ')
    return {
      success: false,
      errors: { [imageField]: [`Accepted file types: ${typesList}`] }
    }
  }

  return parsed
}

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
