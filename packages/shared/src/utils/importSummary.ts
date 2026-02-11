import { ErrorObject, ErrorObjectSchema, ImportSummary, ImportSummarySchema } from "../schemas"

export function parseErrorObject(
  value: unknown
): ErrorObject | null {
  if (!value) return null

  const result = ErrorObjectSchema.safeParse(value)
  return result.success ? result.data : null
}

export function parseImportSummary(
  value: unknown
): ImportSummary | null {
  if (!value) return null

  const result = ImportSummarySchema.safeParse(value)
  return result.success ? result.data : null
}
