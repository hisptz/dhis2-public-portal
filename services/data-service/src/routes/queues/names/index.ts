import logger from "@/logging";
import { NextFunction, Request, Response } from "express";
import { Operation } from "express-openapi";
import { getQueueNames } from "@/variables/queue-names";

export const GET: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const configId = req.params.id;  
        
        if (!configId) {
            return res.status(400).json({
                success: false,
                error: "configId is required",
                timestamp: new Date().toISOString()
            });
        }
        
        const queueNames = getQueueNames(configId);
        
        res.json({
            success: true,
            configId,
            queues: queueNames,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error(`Failed to get queue names for ${req.params.id}:`, error);
        
        // Ensure error is properly serialized
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        res.status(500).json({
            success: false,
            configId: req.params.id,
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
};

GET.apiDoc = {
    summary: "List queue names for a config",
    description: "Returns the names of all queues for a specific config",
    operationId: "listConfigQueueNames",
    tags: ["QUEUE MANAGEMENT"],
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
            description: "Queue names retrieved successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            configId: { type: "string" },
                            queues: {
                                type: "object",
                                properties: {
                                    metadataDownload: { type: "string" },
                                    metadataUpload: { type: "string" },
                                    dataDownload: { type: "string" },
                                    dataUpload: { type: "string" },
                                    dataDeletion: { type: "string" },
                                    failed: { type: "string" }
                                }
                            },
                            timestamp: { type: "string" }
                        }
                    }
                }
            }
        },
        "500": {
            description: "Failed to get queue names"
        }
    }
};