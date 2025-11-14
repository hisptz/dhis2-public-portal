import { NextFunction, Request, Response } from 'express';
import logger from '@/logging';
import { Operation } from 'express-openapi';
import { AxiosError } from 'axios';
import { fromError } from 'zod-validation-error';
import { uploadDataFromQueue, completeUpload } from '@/services/data-migration/data-upload';
import { dataUploadBodySchema } from '@packages/shared/schemas';

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        const parsedBody = dataUploadBodySchema.parse(req.body);
        
         const uploadJobData = {
            mainConfigId: configId,
            filename: parsedBody.filename,
            payload: parsedBody.payload,
            queuedAt: parsedBody.queuedAt || new Date().toISOString(),
            downloadedFrom: parsedBody.downloadedFrom,
        };

        await uploadDataFromQueue(uploadJobData);

        res.json({
            status: "completed",
            message: `Data upload completed successfully for config ${configId}`,
            filename: parsedBody.filename,
        });
    } catch (e: any) {
        logger.error(`Error in data upload endpoint for config ${req.params.id}:`, e);
        
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

export const GET: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        
        logger.info(`Getting upload summary for config: ${configId}`);

        await completeUpload(configId);

        res.json({
            status: "success",
            message: `Upload summary generated for config ${configId}`,
        });
    } catch (e: any) {
        logger.error(`Error getting upload summary for config ${req.params.id}:`, e);
        
        res.status(500).json({
            status: "failed",
            message: e.message,
        });
    }
};

// API Documentation
POST.apiDoc = {
    summary: "Upload data for a configuration",
    description: "Uploads data from a specified file to DHIS2 instance",
    operationId: "uploadData",
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
                    oneOf: [
                        { required: ["filename"] },
                        { required: ["payload"] }
                    ],
                    properties: {
                        filename: {
                            type: "string",
                            description: "Path to the data file to upload",
                            minLength: 1
                        },
                        payload: {
                            type: "object",
                            description: "Direct data payload to upload (alternative to filename)",
                            properties: {
                                dataValues: {
                                    type: "array",
                                    items: { type: "object" },
                                    description: "Array of data values to upload"
                                }
                            }
                        },
                        queuedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Timestamp when the upload was queued"
                        },
                        downloadedFrom: {
                            type: "string",
                            description: "Source configuration ID from which data was downloaded"
                        }
                    }
                }
            }
        }
    },
    responses: {
        "200": {
            description: "Data upload completed successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: { type: "string", example: "completed" },
                            message: { type: "string" },
                            filename: { type: "string" }
                        }
                    }
                }
            }
        },
        "400": {
            description: "Bad request - invalid request body"
        },
        "500": {
            description: "Internal server error during data upload"
        }
    }
};

GET.apiDoc = {
    summary: "Get upload summary for a configuration",
    description: "Generates and retrieves upload summary for completed data uploads",
    operationId: "getUploadSummary",
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
    responses: {
        "200": {
            description: "Upload summary generated successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: { type: "string", example: "success" },
                            message: { type: "string" }
                        }
                    }
                }
            }
        },
        "500": {
            description: "Internal server error while generating upload summary"
        }
    }
};
