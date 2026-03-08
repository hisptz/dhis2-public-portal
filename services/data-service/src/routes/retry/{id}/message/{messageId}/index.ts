import { Request, Response } from 'express'
import logger from '@/logging'
import { Operation } from 'express-openapi'

export const GET: Operation = async (req: Request, res: Response) => {
    try {
        const { id: configId, messageId } = req.params
        return res.status(404).json({
            error: 'Message not found',
            message: `No failed message found with ID: ${messageId} for config: ${configId}`,
        })
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error in get message details endpoint:`, {
                configId: req.params.id,
                messageId: req.params.messageId,
                error: error.message,
            })

            res.status(500).json({
                error: 'Failed to get message details',
                message:
                    error.message ||
                    'An unexpected error occurred while retrieving message details',
                configId: req.params.id,
                messageId: req.params.messageId,
            })
        }
    }
}

GET.apiDoc = {
    summary: 'Get failed message details',
    description: 'Retrieve details of a specific failed message',
    operationId: 'getFailedMessageDetails',
    tags: ['RETRY'],
    parameters: [
        {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Configuration ID',
        },
        {
            in: 'path',
            name: 'messageId',
            required: true,
            schema: { type: 'string' },
            description: 'Message ID to get details for',
        },
    ],
    responses: {
        '200': {
            description: 'Message details retrieved successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            configId: { type: 'string' },
                            messageId: { type: 'string' },
                            details: {
                                type: 'object',
                                properties: {
                                    processType: { type: 'string' },
                                    sourceQueue: { type: 'string' },
                                    errorMessage: { type: 'string' },
                                    failureReason: { type: 'string' },
                                    retryCount: { type: 'integer' },
                                    payload: { type: 'object' },
                                    headers: { type: 'object' },
                                },
                            },
                        },
                    },
                },
            },
        },
        '404': {
            description: 'Message not found',
        },
        '500': {
            description: 'Failed to get message details',
        },
    },
}
