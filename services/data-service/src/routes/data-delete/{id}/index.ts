import { NextFunction, Request, Response } from 'express'
import logger from '@/logging'
import { Operation } from 'express-openapi'
import { AxiosError } from 'axios'
import { fromError } from 'zod-validation-error'
import { deleteAndQueueData } from '@/services/data-migration/data-delete'
import { dataDownloadBodySchema } from '@packages/shared/schemas'

export const GET: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id: configId } = req.params

        const dataItemsConfigIds = req.query.dataItemsConfigIds
            ? JSON.parse(
                  decodeURIComponent(req.query.dataItemsConfigIds as string)
              )
            : []
        const runtimeConfig = req.query.runtimeConfig
            ? JSON.parse(decodeURIComponent(req.query.runtimeConfig as string))
            : {}

        const parsedBody = dataDownloadBodySchema.parse({
            dataItemsConfigIds,
            runtimeConfig,
        })

        logger.info(`Starting data delete process for config: ${configId}`, {
            dataItemsCount: parsedBody.dataItemsConfigIds.length,
            periodsCount: parsedBody.runtimeConfig.periods.length,
        })

        await deleteAndQueueData({
            mainConfigId: configId,
            dataItemsConfigIds: parsedBody.dataItemsConfigIds,
            runtimeConfig: parsedBody.runtimeConfig,
        })

        logger.info(
            `Data delete jobs successfully queued for config: ${configId}`
        )

        res.json({
            status: 'queued',
            message: `Data delete process started for config ${configId}`,
        })
    } catch (e: any) {
        logger.error(
            `Error in data delete endpoint for config ${req.params.id}:`,
            e
        )

        if (e instanceof AxiosError) {
            res.status(e.status ?? 500).json({
                status: 'failed',
                message: e.message,
                details: e.response?.data,
            })
            return
        } else if (e.errors) {
            logger.error(`Invalid request body: ${e.message}`)
            res.status(400).json({
                status: 'failed',
                message: fromError(e).toString(),
                details: e.errors,
            })
            return
        } else {
            res.status(500).json({
                status: 'failed',
                message: e.message,
            })
        }
    }
}

GET.apiDoc = {
    summary: 'Delete data from DHIS2 destination (via query parameters)',
    description: `Deletes data from DHIS2 destination based on the specified periods, configuration, and data items. 
    This operation is irreversible. Uses query parameters for DHIS2 route compatibility.
    
    Example usage:
    GET /data-delete/{id}?dataItemsConfigIds=["item1","item2"]&runtimeConfig={"periods":["202301","202302"],"pageSize":50}
    
    The dataItemsConfigIds and runtimeConfig parameters should be JSON stringified arrays/objects.`,
    operationId: 'deleteDataQuery',
    tags: ['DATA'],
    parameters: [
        {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Configuration ID',
        },
        {
            in: 'query',
            name: 'dataItemsConfigIds',
            required: true,
            schema: {
                type: 'string',
                example: '["dataItem1","dataItem2"]',
            },
            description: `JSON stringified array of data item configuration IDs to delete.
            Example: ["dataItemConfigId1", "dataItemConfigId2"]`,
        },
        {
            in: 'query',
            name: 'runtimeConfig',
            required: true,
            schema: {
                type: 'string',
                example:
                    '{"periods":["202301","202302"],"pageSize":50,"paginateByData":false,"timeout":30000}',
            },
            description: `JSON stringified runtime configuration object.
            Required fields:
            - periods: array of period IDs (e.g., ["202301", "202302"])
            
            Optional fields:
            - pageSize: number (default: 50) - Page size for pagination during deletion
            - paginateByData: boolean (default: false) - Whether to paginate by data elements
            - timeout: number (default: 30000) - Request timeout in milliseconds`,
        },
    ],
    responses: {
        '200': {
            description: 'Data deletion process started successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                example: 'queued',
                                description: 'Status of the deletion operation',
                            },
                            message: {
                                type: 'string',
                                example:
                                    'Data delete process started for config abc123',
                                description: 'Confirmation message',
                            },
                        },
                    },
                },
            },
        },
        '400': {
            description:
                'Bad request - invalid query parameters or missing required fields',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', example: 'failed' },
                            message: { type: 'string' },
                            details: { type: 'object' },
                        },
                    },
                },
            },
        },
        '500': {
            description: 'Internal server error during data deletion',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', example: 'failed' },
                            message: { type: 'string' },
                            details: { type: 'object' },
                        },
                    },
                },
            },
        },
    },
}

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id: configId } = req.params
        const parsedBody = dataDownloadBodySchema.parse(req.body)

        logger.info(`Starting data delete process for config: ${configId}`, {
            dataItemsCount: parsedBody.dataItemsConfigIds.length,
            periodsCount: parsedBody.runtimeConfig.periods.length,
        })

        await deleteAndQueueData({
            mainConfigId: configId,
            dataItemsConfigIds: parsedBody.dataItemsConfigIds,
            runtimeConfig: parsedBody.runtimeConfig,
        })

        logger.info(
            `Data delete jobs successfully queued for config: ${configId}`
        )

        res.json({
            status: 'queued',
            message: `Data delete process started for config ${configId}`,
        })
    } catch (e: any) {
        logger.error(
            `Error in data delete endpoint for config ${req.params.id}:`,
            e
        )

        if (e instanceof AxiosError) {
            res.status(e.status ?? 500).json({
                status: 'failed',
                message: e.message,
                details: e.response?.data,
            })
            return
        } else if (e.errors) {
            logger.error(`Invalid request body: ${e.message}`)
            res.status(400).json({
                status: 'failed',
                message: fromError(e).toString(),
                details: e.errors,
            })
            return
        } else {
            res.status(500).json({
                status: 'failed',
                message: e.message,
            })
        }
    }
}

POST.apiDoc = {
    summary: 'Delete data from DHIS2 destination (via request body)',
    description: `Deletes data from DHIS2 destination based on the specified periods, configuration, and data items. 
    This operation is irreversible. Uses request body for direct API calls.
    
    Note: For DHIS2 route compatibility, prefer using the GET method with query parameters instead.`,
    operationId: 'deleteData',
    tags: ['DATA'],
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
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    required: ['dataItemsConfigIds', 'runtimeConfig'],
                    properties: {
                        dataItemsConfigIds: {
                            type: 'array',
                            items: { type: 'string' },
                            description:
                                'Array of data item configuration IDs to delete',
                        },
                        runtimeConfig: {
                            type: 'object',
                            required: ['periods'],
                            properties: {
                                periods: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description:
                                        'Array of period IDs for data deletion',
                                },
                                pageSize: {
                                    type: 'number',
                                    description:
                                        'Page size for pagination during deletion',
                                    default: 50,
                                },
                                paginateByData: {
                                    type: 'boolean',
                                    description:
                                        'Whether to paginate by data elements',
                                    default: false,
                                },
                                timeout: {
                                    type: 'number',
                                    description:
                                        'Request timeout in milliseconds',
                                    default: 30000,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    responses: {
        '200': {
            description: 'Data deletion process started successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                example: 'queued',
                                description: 'Status of the deletion operation',
                            },
                            message: {
                                type: 'string',
                                example:
                                    'Data delete process started for config abc123',
                                description: 'Confirmation message',
                            },
                        },
                    },
                },
            },
        },
        '400': {
            description:
                'Bad request - invalid request body or missing required fields',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', example: 'failed' },
                            message: { type: 'string' },
                            details: { type: 'object' },
                        },
                    },
                },
            },
        },
        '500': {
            description: 'Internal server error during data deletion',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', example: 'failed' },
                            message: { type: 'string' },
                            details: { type: 'object' },
                        },
                    },
                },
            },
        },
    },
}
