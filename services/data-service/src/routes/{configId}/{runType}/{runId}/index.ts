import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import logger from '@/logging'
import { dbClient } from '@/clients/prisma'
import { getRunStatus } from '@/utils/status'

export const GET: Operation = async (req: Request, res: Response) => {
    try {
        const { configId, runType, runId } = req.params;
        const run = runType === 'metadata' ? await dbClient.metadataRun.findUnique({
            where: {
                uid: runId,
                mainConfigId: configId,
            },
            include: {
                downloads: true,
                uploads: true,
            },
        }) : await dbClient.dataRun.findUnique({
            where: {
                uid: runId,
                mainConfigId: configId,
            },
            include: {
                downloads: true,
                uploads: true,
            },
        })
        if (!run) {
            res.status(404).json({
                status: "failed",
                message: "Run not found",
            });
            return;
        }
        res.json({
            ...run,
            status: await getRunStatus({ runId, runType }),
        });
    } catch (error) {
        logger.error(`Failed to get ${req.params.runType} run ${req.params.runId} for config ${req.params.configId}:`, error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            configId: req.params.configId,
            runType: req.params.runType,
            runId: req.params.runId,
            timestamp: new Date().toISOString(),
        })
    }
}

GET.apiDoc = {
    summary: 'Get the details and status of a run',
    tags: ['Data Service'],
    parameters: [
        {
            name: 'configId',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
            },
        },
        {
            name: 'runType',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
                enum: ['metadata', 'data'],
            },
        },
        {
            name: 'runId',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
            },
        },
    ],
    responses: {
        200: {
            description: 'Run details and status',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            uid: { type: 'string' },
                            mainConfigId: { type: 'string' },
                            runType: { type: 'string' },
                            startedAt: { type: 'string', format: 'date-time' },
                            completedAt: { type: 'string', format: 'date-time' },
                            status: { type: 'string' },
                            downloads: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        uid: { type: 'string' },
                                        status: { type: 'string' },
                                    },
                                },
                            },
                            uploads: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        uid: { type: 'string' },
                                        fileName: { type: 'string' },
                                        status: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        400: {
            description: 'Bad request',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            error: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
        404: {
            description: 'Run not found',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            error: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            error: { type: 'string' },
                            configId: { type: 'string' },
                            runType: { type: 'string' },
                            runId: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
    }
}
