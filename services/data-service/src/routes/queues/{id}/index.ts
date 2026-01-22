import logger from '@/logging'
import { NextFunction, Request, Response } from 'express'
import { Operation } from 'express-openapi'
import {
    createQueuesForConfig,
    deleteConfigQueues,
} from '@/rabbit/queue-manager'

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configId = req.params.id
        logger.info(`Creating queues for configId: ${configId}`)
        const queueNames = await createQueuesForConfig(configId)
        res.json({
            success: true,
            configId,
            queues: queueNames,
            message: 'Queues created successfully',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        logger.error(`Failed to create queues for ${req.params.id}:`, error)

        const statusCode = (error as Error).message.includes('not found')
            ? 404
            : 500
        const errorMessage =
            error instanceof Error ? error.message : String(error)

        res.status(statusCode).json({
            success: false,
            configId: req.params.id,
            error: errorMessage,
            timestamp: new Date().toISOString(),
        })
    }
}

export const DELETE: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id: configId } = req.params
        logger.info(`DELETE API request for configId: ${configId}`)

        const result = await deleteConfigQueues(configId)

        res.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error)
        logger.error(
            `Failed to delete queues for ${req.params.id}: ${errorMessage}`
        )

        res.status(500).json({
            success: false,
            configId: req.params.id,
            error: errorMessage,
            timestamp: new Date().toISOString(),
        })
    }
}

export const GET: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configId = req.params.id
        logger.info(`API request: Get queue stats for configId: ${configId}`)

        if (!configId) {
            return res.status(400).json({
                success: false,
                error: 'configId is required',
                timestamp: new Date().toISOString(),
            })
        }

        res.json({
            success: true,
            configId,
            message: 'Queue stats endpoint working',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        logger.error(`Failed to get queue stats for ${req.params.id}:`, error)

        const errorMessage =
            error instanceof Error ? error.message : String(error)

        res.status(500).json({
            success: false,
            configId: req.params.id,
            error: errorMessage,
            timestamp: new Date().toISOString(),
        })
    }
}

GET.apiDoc = {
    summary: 'Get queue statistics for a config',
    description:
        'Returns message counts and consumer information for all queues of a specific config',
    operationId: 'getConfigQueueStats',
    tags: ['QUEUE MANAGEMENT'],
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
            description: 'Queue statistics retrieved successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            configId: { type: 'string' },
                            queues: { type: 'object' },
                            timestamp: { type: 'string' },
                        },
                    },
                },
            },
        },
        '500': {
            description: 'Failed to get queue statistics',
        },
    },
}

POST.apiDoc = {
    summary: 'Create queues for a config',
    description: 'Creates all necessary queues for a specific configuration',
    operationId: 'createConfigQueues',
    tags: ['QUEUE MANAGEMENT'],
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
            description: 'Queues created successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            configId: { type: 'string' },
                            queues: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                            message: { type: 'string' },
                            timestamp: { type: 'string' },
                        },
                    },
                },
            },
        },
        '404': {
            description: 'Configuration not found',
        },
        '500': {
            description: 'Failed to create queues',
        },
    },
}

DELETE.apiDoc = {
    summary: 'Delete all queues for a config',
    description: 'Permanently deletes all queues of a specific config',
    operationId: 'deleteConfigQueues',
    tags: ['QUEUE MANAGEMENT'],
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
            description: 'Queues deleted successfully',
        },
        '500': {
            description: 'Failed to delete queues',
        },
    },
}
