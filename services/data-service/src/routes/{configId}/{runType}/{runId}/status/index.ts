import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import logger from '@/logging'
import { dbClient } from '@/clients/prisma'
import { getRunStatus } from '@/utils/status'

export const GET: Operation = async (req: Request, res: Response) => {
    try {
        const { configId, runType, runId } = req.params

        if (!configId || !runType || !runId) {
            return res.status(400).json({
                success: false,
                error: 'Configuration ID, run type and run ID are required',
                timestamp: new Date().toISOString(),
            })
        }

        const run =
            runType == 'metadata'
                ? await dbClient.metadataRun.findFirst({
                      where: {
                          mainConfigId: configId,
                      },
                      orderBy: {
                          startedAt: 'desc',
                      },
                  })
                : await dbClient.dataRun.findFirst({
                      where: {
                          mainConfigId: configId,
                      },
                      orderBy: {
                          startedAt: 'desc',
                      },
                  })
        if (!run) {
            res.status(404).json({
                status: 'failed',
                message: 'Run not found',
            })
            return
        }
        const response = await getRunStatus({ runId, runType })
        res.json(response)
    } catch (error) {
        logger.error(
            `Failed to get run status for ${req.params.runType} run ${req.params.runId}:`,
            error
        )
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
    summary: 'Get the status of a specific run',
    description:
        'Retrieves the current status of a metadata or data run for a given configuration.',
    tags: ['Data Service Runs'],
    parameters: [
        {
            name: 'configId',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
            },
            description: 'The ID of the data service configuration',
        },
        {
            name: 'runType',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
                enum: ['metadata', 'data'],
            },
            description: 'The type of run (metadata or data)',
        },
        {
            name: 'runId',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
            },
            description: 'The ID of the run to retrieve the status for',
        },
    ],
    responses: {
        200: {
            description: 'Run status retrieved successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                description:
                                    'The current status of the run (e.g., RUNNING, SUCCESS, FAILED)',
                            },
                        },
                    },
                },
            },
        },
        400: {
            description: 'Bad request - missing or invalid parameters',
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
                            status: { type: 'string' },
                            message: { type: 'string' },
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
    },
}
