import { NextFunction, Request, Response } from 'express';
import logger from '@/logging';
import { pushToQueue } from '@/rabbit/publisher';
import { Operation } from 'express-openapi';

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;

        if (!configId) {
            return res.status(400).json({
                error: 'Configuration ID is required',
                message: 'Please provide a valid configuration ID in the URL parameters'
            });
        }

        logger.info(`Metadata download and upload request received for config: ${configId}`);
        await pushToQueue(configId, 'metadataDownload', {
            configId,
            requestedAt: new Date().toISOString()
        });
        res.status(202).json({
            message: 'Metadata download initiated successfully',
            configId,
            status: 'processing',
            description: 'Metadata download has been queued for processing'
        });

    } catch (error: any) {
        logger.error('Error in metadata download endpoint:', error);

        res.status(500).json({
            error: 'Metadata download failed',
            message: error.message || 'An unexpected error occurred during metadata download',
            configId: req.params.id
        });
    }
};

POST.apiDoc = {
    summary: "Download metadata for a configuration",
    description: "Initiates metadata download from source DHIS2 instance and queues it for processing",
    operationId: "downloadMetadata",
    tags: ["METADATA"],
    parameters: [
        {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Configuration ID"
        }
    ],
    responses: {
        "202": {
            description: "Metadata download initiated successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: { type: "string" },
                            configId: { type: "string" },
                            status: { type: "string" },
                            description: { type: "string" }
                        }
                    }
                }
            }
        },
        "400": {
            description: "Bad request - missing configuration ID"
        },
        "500": {
            description: "Internal server error during metadata download"
        }
    }
};
