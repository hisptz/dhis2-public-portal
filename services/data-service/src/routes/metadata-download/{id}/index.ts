import { Request, Response } from 'express'
import logger from '@/logging'
import { Operation } from 'express-openapi'
import { metadataMigrationSchema } from '@packages/shared/schemas'
import { dbClient } from '@/clients/prisma'
import { MetadataSourceType } from '@/generated/prisma/enums'
import { pushToQueue } from '@/rabbit/publisher'
import { Queues } from '@/rabbit/constants'

export const POST: Operation = async (req: Request, res: Response) => {
    try {
        const { id: configId } = req.params

        if (!configId) {
            return res.status(400).json({
                error: 'Configuration ID is required',
                message:
                    'Please provide a valid configuration ID in the URL parameters',
            })
        }

        const { success, data, error } = metadataMigrationSchema.safeParse(
            req.body
        )
        if (!success || !data) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                    code: issue.code,
                })),
            })
            return
        }
        logger.info(`Metadata download POST request for config: ${configId}`, {
            data,
        })
        const createdDownloadRun = await dbClient.metadataRun.create({
            data: {
                mainConfigId: configId,
                sourceType:
                    data!.metadataSource === 'source'
                        ? MetadataSourceType.SOURCE_INSTANCE
                        : MetadataSourceType.FLEXIPORTAL_CONFIG,
                ...(data!.metadataSource === 'source'
                    ? {
                          visualizations:
                              data!.selectedVisualizations?.map(
                                  (viz) => viz.id
                              ) ?? [],
                          dashboards:
                              data!.selectedDashboards?.map(
                                  (dashboard) => dashboard.id
                              ) ?? [],
                          maps: data!.selectedMaps?.map((map) => map.id) ?? [],
                      }
                    : {}),
            },
        })
        const queueSuccessful = pushToQueue({
            queue: Queues.METADATA_PROCESSING,
            reference: createdDownloadRun.uid,
        })
        if (queueSuccessful) {
            logger.info(`Metadata download created for config: ${configId}`, {})
            res.status(202).json({
                message: 'Metadata download initiated successfully',
                configId,
                status: 'queued',
            })
        } else {
            await dbClient.metadataRun.delete({
                where: {
                    uid: createdDownloadRun.uid,
                },
            })
            logger.error(
                `Failed to queue metadata download for config: ${configId}`,
                {}
            )
            res.status(500).json({
                error: 'Metadata download failed',
                message: 'Failed to queue metadata download',
            })
        }
    } catch (error) {
        if (error instanceof Error) {
            logger.error('Error in metadata download POST endpoint:', error)
            res.status(500).json({
                error: 'Metadata download failed',
                message:
                    error.message ||
                    'An unexpected error occurred during metadata download',
                configId: req.params.id,
            })
        } else {
            logger.error('Error in metadata download POST endpoint:', error)
            res.status(500).json({
                error: 'Metadata download failed',
                message:
                    'An unexpected error occurred during metadata download',
            })
        }
    }
}

POST.apiDoc = {
    summary: 'Download metadata for a configuration',
    description:
        'Initiates metadata download from source DHIS2 instance and queues it for processing',
    operationId: 'downloadMetadata',
    tags: ['METADATA'],
    parameters: [
        {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Configuration ID',
        },
    ],
    requestBody: {
        required: false,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        metadataSource: {
                            type: 'string',
                            enum: ['source', 'flexiportal-config'],
                            description: 'Source of metadata selection',
                        },
                        selectedVisualizations: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                },
                            },
                        },
                        selectedMaps: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                },
                            },
                        },
                        selectedDashboards: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    responses: {
        '202': {
            description: 'Metadata download initiated successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            configId: { type: 'string' },
                            metadataSource: { type: 'string' },
                            status: { type: 'string' },
                            description: { type: 'string' },
                        },
                    },
                },
            },
        },
        '400': {
            description: 'Bad request - missing configuration ID',
        },
        '500': {
            description: 'Internal server error during metadata download',
        },
    },
}
