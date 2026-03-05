import { z } from "zod"

export const ImportStatusSchema = z.enum([
  "SUCCESS",
  "WARNING",
  "ERROR",
  "OK",
])

export type ImportStatus = z.infer<typeof ImportStatusSchema>

export const ImportStatsSchema = z.object({
  total: z.number(),
  created: z.number(),
  updated: z.number(),
  deleted: z.number(),
  ignored: z.number(),
})

export type ImportStats = z.infer<typeof ImportStatsSchema>

export const DataImportCountSchema = z.object({
  imported: z.number(),
  updated: z.number(),
  deleted: z.number(),
  ignored: z.number(),
})

export type DataImportCount = z.infer<typeof DataImportCountSchema>

export const ErrorReportSchema = z.object({
  message: z.string(),
  errorCode: z.string(),
  mainKlass: z.string(),
  args: z.array(z.string()),
  errorProperties: z.array(z.string()),
})

export type ErrorReport = z.infer<typeof ErrorReportSchema>

export const ObjectReportSchema = z.object({
  uid: z.string().optional(),
  index: z.number(),
  klass: z.string(),
  errorReports: z.array(ErrorReportSchema),
})

export type ObjectReport = z.infer<typeof ObjectReportSchema>

export const TypeReportSchema = z.object({
  klass: z.string(),
  stats: ImportStatsSchema,
  objectReports: z.array(ObjectReportSchema),
})

export type TypeReport = z.infer<typeof TypeReportSchema>

export const DataConflictSchema = z.object({
  value: z.string(),
  object: z.string(),
  indexes: z.array(z.number()),
  objects: z.record(z.string(), z.string()),
  property: z.string(),
  errorCode: z.string(),
})

export type DataConflict = z.infer<typeof DataConflictSchema>

export const DataImportOptionsSchema = z.object({
  async: z.boolean(),
  force: z.boolean(),
  dryRun: z.boolean(),
  mergeMode: z.string(),
  importStrategy: z.string(),
}).catchall(z.any())

export const ImportResponseSchema = z.object({
  stats: ImportStatsSchema,
  status: ImportStatusSchema,
  typeReports: z.array(TypeReportSchema),
  responseType: z.string(),
})

export type ImportResponse = z.infer<typeof ImportResponseSchema>

export const DataImportResponseSchema = z.object({
  status: ImportStatusSchema,
  conflicts: z.array(DataConflictSchema),
  description: z.string(),
  importCount: DataImportCountSchema,
  responseType: z.string(),
  importOptions: DataImportOptionsSchema,
  dataSetComplete: z.string(),
  rejectedIndexes: z.array(z.number()),
})

export type DataImportResponse = z.infer<typeof DataImportResponseSchema>

export const ErrorObjectSchema = z.object({
  status: z.union([z.literal("WARNING"), z.literal("ERROR")]),
  message: z.string(),
  httpStatus: z.string(),
  httpStatusCode: z.number(),
  response: ImportResponseSchema.optional(),
})

export const DataErrorObjectSchema = z.object({
  status: z.union([z.literal("WARNING"), z.literal("ERROR")]),
  message: z.string(),
  response: DataImportResponseSchema,
  httpStatus: z.string(),
  httpStatusCode: z.number(),
})

export type DataErrorObject = z.infer<typeof DataErrorObjectSchema>

export type MetadataErrorObject = z.infer<typeof ErrorObjectSchema>


export const ImportSummarySchema = z.object({
  status: z.literal("OK"),
  response: ImportResponseSchema,
  httpStatus: z.literal("OK"),
  httpStatusCode: z.literal(200),
})

export type ImportSummary = z.infer<typeof ImportSummarySchema>

