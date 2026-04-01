import { z } from 'zod'

export enum DataServiceRunStatus {
    NOT_STARTED = 'NOT_STARTED',
    IDLE = 'IDLE',
    RUNNING = 'RUNNING',
    QUEUED = 'QUEUED',
    UNKNOWN = 'UNKNOWN',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export const dataServiceRunStatusSchema = z.nativeEnum(DataServiceRunStatus)

export const queueStatus = z.enum(['running', 'stopped'])

export const queueDetails = z.object({
    name: z.string(),
    messages: z.number(),
    messages_ready: z.number(),
    messages_unacknowledged: z.number(),
    status: queueStatus,
})

export type QueueDetails = z.infer<typeof queueDetails>

const queueStatusResultSchema = z.object({
    queue: z.string(),
    messages: z.number(),
    messages_ready: z.number(),
    messages_unacknowledged: z.number(),
    dlq_messages: z.number(),
    status: dataServiceRunStatusSchema,
})

export const systemHealthSchema = z.object({
    healthy: z.boolean(),
    totalQueues: z.number(),
    activeQueues: z.number(),
    failedQueues: z.number(),
    issues: z.array(z.string()),
})

export type SystemHealth = z.infer<typeof systemHealthSchema>

export type QueueStatusResult = z.infer<typeof queueStatusResultSchema>

export const baseStatusPayloadSchema = z.object({
    success: z.boolean(),
    configId: z.string(),
    timestamp: z.string(),
})

export const successStatusPayloadSchema = baseStatusPayloadSchema.extend({
    success: z.literal(true),
    processes: z.object({
        metadataDownload: z.object({
            queued: z.number(),
            processing: z.number(),
            failed: z.number(),
        }),
    }),
    queues: z.object({
        metadataDownload: queueStatusResultSchema.optional(),
        metadataUpload: queueStatusResultSchema.optional(),
        dataDownload: queueStatusResultSchema.optional(),
        dataUpload: queueStatusResultSchema.optional(),
        dataDeletion: queueStatusResultSchema.optional(),
        dlq: queueStatusResultSchema.optional(),
    }),
    health: systemHealthSchema.optional(),
})

export type SuccessStatusPayload = z.infer<typeof successStatusPayloadSchema>

export const failureStatusPayloadSchema = baseStatusPayloadSchema.extend({
    success: z.literal(false),
    message: z.string(),
})

export type FailureStatusPayload = z.infer<typeof failureStatusPayloadSchema>

export const statusPayloadSchema = z.discriminatedUnion('success', [
    successStatusPayloadSchema,
    failureStatusPayloadSchema,
])

export type StatusPayload = z.infer<typeof statusPayloadSchema>
