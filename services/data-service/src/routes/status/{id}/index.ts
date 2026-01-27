import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import logger from '@/logging'
import { getMultipleQueueStatus, getSystemHealth } from '@/services/status'
import { getQueueNames } from '@/variables/queue-names'
import {
    FailureStatusPayload,
    QueueStatusResult,
    statusPayloadSchema,
    SuccessStatusPayload,
} from '@packages/shared/schemas'

import { z } from 'zod'
import { convertSync } from '@openapi-contrib/json-schema-to-openapi-schema'
import { dbClient } from '@/clients/prisma'

export const GET: Operation = async (req: Request, res: Response) => {
    try {
        const { id: configId } = req.params

        if (!configId) {
            return res.status(400).json({
                success: false,
                error: 'Configuration ID is required',
                timestamp: new Date().toISOString(),
            })
        }

        const [data, meta] = await Promise.all([
            await dbClient.dataRun.findFirst({
                where: {
                    mainConfigId: configId,
                },
                orderBy: {
                    startedAt: 'desc',
                },
            }),
            await dbClient.metadataRun.findFirst({
                where: {
                    mainConfigId: configId,
                },
                orderBy: {
                    startedAt: 'desc',
                },
            }),
        ])

        const queueNames = getQueueNames(configId)
        const allQueueNames = [
            queueNames.metadataDownload,
            queueNames.metadataUpload,
            queueNames.dataDownload,
            queueNames.dataUpload,
            queueNames.dataDeletion,
            queueNames.failed,
        ]

        const queueStatuses = await getMultipleQueueStatus(
            allQueueNames,
            configId
        )
        const health = await getSystemHealth([configId])

        const statusByType = {
            metadataDownload: queueStatuses.find(
                (q) => q.queue === queueNames.metadataDownload
            ),
            metadataUpload: queueStatuses.find(
                (q) => q.queue === queueNames.metadataUpload
            ),
            dataDownload: queueStatuses.find(
                (q) => q.queue === queueNames.dataDownload
            ),
            dataUpload: queueStatuses.find(
                (q) => q.queue === queueNames.dataUpload
            ),
            dataDeletion: queueStatuses.find(
                (q) => q.queue === queueNames.dataDeletion
            ),
            dlq: queueStatuses.find((q) => q.queue === queueNames.failed),
        }

        const buildProcessStatusFromQueue = (queueData?: QueueStatusResult) => {
            if (!queueData)
                return {
                    queued: 0,
                    processing: 0,
                    failed: 0,
                }
            return {
                queued: queueData?.messages_ready || 0,
                processing: queueData?.messages_unacknowledged || 0,
                failed: 0,
            }
        }

        const processes = {
            metadataDownload: buildProcessStatusFromQueue(
                statusByType.metadataDownload
            ),
            metadataUpload: buildProcessStatusFromQueue(
                statusByType.metadataUpload
            ),
            dataDownload: buildProcessStatusFromQueue(
                statusByType.dataDownload
            ),
            dataUpload: buildProcessStatusFromQueue(statusByType.dataUpload),
            dataDeletion: buildProcessStatusFromQueue(
                statusByType.dataDeletion
            ),
        }

        const statusPayload: SuccessStatusPayload = {
            success: true,
            configId,
            queues: statusByType,
            processes,
            health,
            timestamp: new Date().toISOString(),
        }

        res.json(statusPayload)
    } catch (error) {
        logger.error(`Failed to get status for config ${req.params.id}:`, error)

        const errorMessage =
            error instanceof Error ? error.message : String(error)

        const errorResponse: FailureStatusPayload = {
            success: false,
            message: errorMessage,
            timestamp: new Date().toISOString(),
            configId: req.params.id,
        }

        res.status(500).json(errorResponse)
    }
}

GET.apiDoc = {
    summary: 'Get queue status for a configuration',
    description:
        'Returns detailed status information for all queues associated with a specific configuration',
    operationId: 'getConfigStatus',
    tags: ['STATUS'],
    parameters: [
        {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Configuration ID',
        },
    ],
    responses: {
        '200': {
            description: 'Configuration status retrieved successfully',
            content: {
                'application/json': {
                    schema: convertSync(
                        z.toJSONSchema(statusPayloadSchema, {
                            io: 'input',
                        })
                    ),
                },
            },
        },
        '400': {
            description: 'Bad request - missing configuration ID',
        },
        '500': {
            description: 'Internal server error',
        },
    },
}
