import { NextFunction, Request, Response } from 'express';
import logger from '@/logging';
import { Operation } from 'express-openapi';
import { AxiosError } from 'axios';
import { fromError } from 'zod-validation-error';
import { deleteAndQueueData, completeDelete } from '@/services/data-migration/data-delete';
import { dataDownloadBodySchema } from '@packages/shared/schemas';  

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        const parsedBody = dataDownloadBodySchema.parse(req.body);
        
        logger.info(`Starting data delete process for config: ${configId}`, {
            dataItemsCount: parsedBody.dataItemsConfigIds.length,
            periodsCount: parsedBody.runtimeConfig.periods.length,
        });

        await deleteAndQueueData({
            mainConfigId: configId,
            dataItemsConfigIds: parsedBody.dataItemsConfigIds,
            runtimeConfig: parsedBody.runtimeConfig,
        });

        logger.info(`Data delete jobs successfully queued for config: ${configId}`);

        res.json({
            status: "queued",
            message: `Data delete process started for config ${configId}`,
        });
    } catch (e: any) {
        logger.error(`Error in data delete endpoint for config ${req.params.id}:`, e);
        
        if (e instanceof AxiosError) {
            res.status(e.status ?? 500).json({
                status: "failed",
                message: e.message,
                details: e.response?.data,
            });
            return;
        } else if (e.errors) {
            logger.error(`Invalid request body: ${e.message}`);
            res.status(400).json({
                status: "failed",
                message: fromError(e).toString(),
                details: e.errors,
            });
            return;
        } else {
            res.status(500).json({
                status: "failed",
                message: e.message,
            });
        }
    }
};

export const DELETE: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        const { confirm } = req.query;
        
        if (confirm !== 'true') {
            return res.status(400).json({
                status: "failed",
                message: "Confirmation required. Set 'confirm=true' to proceed with data deletion."
            });
        }

        logger.info(`Getting delete summary for config: ${configId}`);

        await completeDelete(configId);

        res.json({
            status: "success",
            message: `Delete summary generated for config ${configId}`,
        });
    } catch (e: any) {
        logger.error(`Error in data deletion endpoint for config ${req.params.id}:`, e);
        
        if (e instanceof AxiosError) {
            res.status(e.status ?? 500).json({
                status: "failed",
                message: e.message,
                details: e.response?.data,
            });
            return;
        } else {
            res.status(500).json({
                status: "failed",
                message: e.message,
            });
        }
    }
};

POST.apiDoc = {
    summary: "Delete data from DHIS2 destination",
    description: "Deletes data from DHIS2 destination based on the specified periods, configuration, and data items. This operation is irreversible.",
    operationId: "deleteData",
    tags: ["DATA"],
    parameters: [
        {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Configuration ID"
        }
    ],
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["dataItemsConfigIds", "runtimeConfig"],
                    properties: {
                        dataItemsConfigIds: {
                            type: "array",
                            items: { type: "string" },
                            description: "Array of data item configuration IDs to delete"
                        },
                        runtimeConfig: {
                            type: "object",
                            required: ["periods"],
                            properties: {
                                periods: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Array of period IDs for data deletion"
                                },
                                pageSize: {
                                    type: "number",
                                    description: "Page size for pagination during deletion",
                                    default: 50
                                },
                                paginateByData: {
                                    type: "boolean",
                                    description: "Whether to paginate by data elements",
                                    default: false
                                },
                                timeout: {
                                    type: "number",
                                    description: "Request timeout in milliseconds",
                                    default: 30000
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    responses: {
        "200": {
            description: "Data deletion process started successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: { type: "string", example: "queued" },
                            message: { type: "string" }
                        }
                    }
                }
            }
        },
        "400": {
            description: "Bad request - invalid request body"
        },
        "500": {
            description: "Internal server error during data deletion"
        }
    }
};

DELETE.apiDoc = {
    summary: "Complete data deletion process",
    description: "Completes the data deletion process and generates summary for a specific configuration.",
    operationId: "completeDataDeletion",
    tags: ["DATA"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string"
            },
            description: "Configuration ID"
        },
        {
            name: "confirm",
            in: "query",
            required: true,
            schema: {
                type: "string",
                enum: ["true"]
            },
            description: "Confirmation flag - must be 'true' to proceed with deletion"
        }
    ],
    responses: {
        200: {
            description: "Data files deleted successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: { type: "string", example: "success" },
                            message: { type: "string" },
                            filesDeleted: { type: "number" },
                            totalSizeDeleted: { type: "string" },
                            directoryRemoved: { type: "boolean" }
                        }
                    }
                }
            }
        },
        400: {
            description: "Bad request - confirmation required"
        },
        404: {
            description: "Configuration not found or no data to delete"
        },
        500: {
            description: "Failed to delete data files"
        }
    }
};