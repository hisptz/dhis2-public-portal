import { NextFunction, Request, Response } from 'express';
import logger from '@/logging';
import { Operation } from 'express-openapi';
import { updateProgress } from '@/utils/progress-tracker';
import { dataDownloadBodySchema } from '@packages/shared/schemas';
import { AxiosError } from 'axios';
import { fromError } from 'zod-validation-error';
import { downloadAndQueueData } from '@/services/data-migration/data-download';

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        const parsedBody = dataDownloadBodySchema.parse(req.body);
        
        // Initialize progress tracking
        const totalExpectedJobs = parsedBody.dataItemsConfigIds.length * parsedBody.runtimeConfig.periods.length;
        await updateProgress(configId, 'data-download', totalExpectedJobs, 0);

        await downloadAndQueueData({
            mainConfigId: configId,
            dataItemsConfigIds: parsedBody.dataItemsConfigIds,
            runtimeConfig: parsedBody.runtimeConfig,
        });

        logger.info(`Data download jobs successfully queued for config: ${configId}`);

        res.json({
            status: "queued",
            message: `Data download process started for config ${configId}`,
        });
    } catch (e: any) {
        logger.error(`Error in data download endpoint for config ${req.params.id}:`, e);
        
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

POST.apiDoc = {
    summary: "Start data download process",
    description: "Initiates the data download process for a specific configuration. Downloads data from the source DHIS2 instance based on the specified data items configurations and runtime parameters. The process runs asynchronously using a job queue system.",
    operationId: "startDataDownload",
    tags: ["DATA MIGRATION"],
    parameters: [
        {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Configuration ID for the data source"
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
                            minItems: 1,
                            description: "Array of data items configuration IDs to download",
                            example: ["config-item-1", "config-item-2"]
                        },
                        runtimeConfig: {
                            type: "object",
                            required: ["periods"],
                            properties: {
                                periods: {
                                    type: "array",
                                    items: { type: "string" },
                                    minItems: 1,
                                    description: "Array of period identifiers to download data for",
                                    example: ["202301", "202302", "202303"]
                                },
                                pageSize: {
                                    type: "integer",
                                    minimum: 1,
                                    maximum: 10000,
                                    description: "Number of records to fetch per API request",
                                    example: 1000
                                },
                                timeout: {
                                    type: "integer",
                                    minimum: 1000,
                                    maximum: 300000,
                                    description: "Request timeout in milliseconds",
                                    example: 30000
                                },
                                paginateByData: {
                                    type: "boolean",
                                    description: "Whether to paginate by data elements instead of organisation units",
                                    example: false
                                },
                                overrides: {
                                    type: "object",
                                    description: "Configuration overrides for this specific download",
                                    properties: {
                                        parentOrgUnitId: {
                                            type: "string",
                                            description: "Override the parent organisation unit ID",
                                            example: "ImspTQPwCqd"
                                        },
                                        orgUnitLevelId: {
                                            type: "integer",
                                            minimum: 1,
                                            description: "Override the organisation unit level",
                                            example: 3
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                examples: {
                    basicDownload: {
                        summary: "Basic data download",
                        value: {
                            dataItemsConfigIds: ["config-item-1"],
                            runtimeConfig: {
                                periods: ["202301", "202302"],
                                pageSize: 1000,
                                timeout: 30000
                            }
                        }
                    },
                    advancedDownload: {
                        summary: "Advanced download with overrides",
                        value: {
                            dataItemsConfigIds: ["config-item-1", "config-item-2"],
                            runtimeConfig: {
                                periods: ["202301", "202302", "202303"],
                                pageSize: 500,
                                timeout: 60000,
                                paginateByData: true,
                                overrides: {
                                    parentOrgUnitId: "ImspTQPwCqd",
                                    orgUnitLevelId: 4
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
            description: "Data download process started successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: {
                                type: "string",
                                enum: ["queued"],
                                example: "queued"
                            },
                            message: {
                                type: "string",
                                example: "Data download process started for config config-123"
                            }
                        }
                    }
                }
            }
        },
        "400": {
            description: "Bad request - invalid request body or parameters",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: {
                                type: "string",
                                enum: ["failed"],
                                example: "failed"
                            },
                            message: {
                                type: "string",
                                example: "Validation error: periods array must contain at least 1 element(s)"
                            },
                            details: {
                                type: "array",
                                description: "Detailed validation errors",
                                items: {
                                    type: "object",
                                    properties: {
                                        code: { type: "string" },
                                        path: { type: "array", items: { type: "string" } },
                                        message: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "404": {
            description: "Configuration not found",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: {
                                type: "string",
                                enum: ["failed"],
                                example: "failed"
                            },
                            message: {
                                type: "string",
                                example: "Configuration not found"
                            }
                        }
                    }
                }
            }
        },
        "500": {
            description: "Internal server error",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: {
                                type: "string",
                                enum: ["failed"],
                                example: "failed"
                            },
                            message: {
                                type: "string",
                                example: "Internal server error occurred during data download initialization"
                            },
                            details: {
                                type: "object",
                                description: "Additional error details (when available)"
                            }
                        }
                    }
                }
            }
        }
    }
};