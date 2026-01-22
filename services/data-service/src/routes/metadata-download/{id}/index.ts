import { NextFunction, Request, Response } from 'express'
import logger from '@/logging'
import { pushToQueue } from '@/rabbit/publisher'
import { Operation } from 'express-openapi'

function parseMetadataRequestData(query: any) {
    const data: any = {
        metadataSource: query.metadataSource || 'flexiportal-config',
        selectedVisualizations: [],
        selectedMaps: [],
        selectedDashboards: [],
    }

    try {
        if (query.selectedVisualizations) {
            const decoded = decodeURIComponent(query.selectedVisualizations)
            data.selectedVisualizations = JSON.parse(decoded)
            logger.info(
                `Parsed selectedVisualizations:`,
                data.selectedVisualizations
            )
        }
        if (query.selectedMaps) {
            const decoded = decodeURIComponent(query.selectedMaps)
            data.selectedMaps = JSON.parse(decoded)
        }
        if (query.selectedDashboards) {
            const decoded = decodeURIComponent(query.selectedDashboards)
            data.selectedDashboards = JSON.parse(decoded)
        }
    } catch (parseError) {
        logger.warn('Failed to parse JSON from query parameters:', parseError)
        logger.warn('Raw selectedVisualizations:', query.selectedVisualizations)
    }

    return data
}

export const GET: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id: configId } = req.params

        const {
            metadataSource,
            selectedVisualizations,
            selectedMaps,
            selectedDashboards,
        } = parseMetadataRequestData(req.query)

        if (!configId) {
            return res.status(400).json({
                error: 'Configuration ID is required',
                message:
                    'Please provide a valid configuration ID in the URL parameters',
            })
        }

        const totalItems =
            selectedVisualizations.length +
            selectedMaps.length +
            selectedDashboards.length
        await pushToQueue(configId, 'metadataDownload', {
            configId,
            metadataSource,
            selectedVisualizations,
            selectedMaps,
            selectedDashboards,
            totalItems,
            requestedAt: new Date().toISOString(),
        })

        res.status(202).json({
            message: 'Metadata download initiated successfully',
            configId,
            metadataSource: metadataSource,
            totalItems,
            status: 'processing',
            description: `Metadata download queued: ${totalItems} items to process`,
        })
    } catch (error: any) {
        logger.error('Error in metadata download GET endpoint:', error)

        res.status(500).json({
            error: 'Metadata download failed',
            message:
                error.message ||
                'An unexpected error occurred during metadata download',
            configId: req.params.id,
        })
    }
}

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id: configId } = req.params
        const {
            metadataSource,
            selectedVisualizations,
            selectedMaps,
            selectedDashboards,
        } = req.body

        if (!configId) {
            return res.status(400).json({
                error: 'Configuration ID is required',
                message:
                    'Please provide a valid configuration ID in the URL parameters',
            })
        }

        const data: any = {
            metadataSource: metadataSource || 'flexiportal-config',
            selectedVisualizations: selectedVisualizations || [],
            selectedMaps: selectedMaps || [],
            selectedDashboards: selectedDashboards || [],
        }

        logger.info(`Metadata download POST request for config: ${configId}`, {
            data,
        })

        const totalItems =
            data.selectedVisualizations.length +
            data.selectedMaps.length +
            data.selectedDashboards.length
        await pushToQueue(configId, 'metadataDownload', {
            configId,
            metadataSource: data.metadataSource,
            selectedVisualizations: data.selectedVisualizations,
            selectedMaps: data.selectedMaps,
            selectedDashboards: data.selectedDashboards,
            totalItems,
            requestedAt: new Date().toISOString(),
        })

        res.status(202).json({
            message: 'Metadata download initiated successfully',
            configId,
            metadataSource: data.metadataSource,
            totalItems,
            status: 'processing',
            description: `Metadata download queued: ${totalItems} items to process`,
        })
    } catch (error: any) {
        logger.error('Error in metadata download POST endpoint:', error)

        res.status(500).json({
            error: 'Metadata download failed',
            message:
                error.message ||
                'An unexpected error occurred during metadata download',
            configId: req.params.id,
        })
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

GET.apiDoc = {
    summary: 'Download metadata for a configuration (using query parameters)',
    description:
        'Initiates metadata download from source DHIS2 instance using query parameters. This method is preferred when using DHIS2 routes.',
    operationId: 'downloadMetadataWithQueryParams',
    tags: ['METADATA'],
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
            name: 'metadataSource',
            required: false,
            schema: {
                type: 'string',
                enum: ['source', 'flexiportal-config'],
                default: 'flexiportal-config',
            },
            description: 'Source of metadata selection',
        },
        {
            in: 'query',
            name: 'selectedVisualizations',
            required: false,
            schema: { type: 'string' },
            description: 'JSON string of selected visualizations array',
        },
        {
            in: 'query',
            name: 'selectedMaps',
            required: false,
            schema: { type: 'string' },
            description: 'JSON string of selected maps array',
        },
        {
            in: 'query',
            name: 'selectedDashboards',
            required: false,
            schema: { type: 'string' },
            description: 'JSON string of selected dashboards array',
        },
    ],
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
                            totalItems: { type: 'number' },
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
