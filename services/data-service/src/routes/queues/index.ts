import logger from "@/logging";
import { NextFunction, Request, Response } from "express";
import { Operation } from "express-openapi";
import { 
    initializeAllQueuesFromDatastore,
} from "@/rabbit/queue-manager";

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        logger.info("API request: Initialize all queues from datastore");
        const result = await initializeAllQueuesFromDatastore();
        
        res.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error("Failed to initialize queues:", error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
            timestamp: new Date().toISOString()
        });
    }
};

POST.apiDoc = {
    summary: "Initialize all queues from datastore",
    description: "Creates queues for all configurations found in the DHIS2 datastore",
    operationId: "initializeAllQueues",
    tags: ["QUEUE MANAGEMENT"],
    responses: {
        "200": {
            description: "Queues initialized successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            total: { type: "number" },
                            successful: { type: "number" },
                            failed: { type: "number" },
                            timestamp: { type: "string" }
                        }
                    }
                }
            }
        },
        "500": {
            description: "Failed to initialize queues",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            error: { type: "string" },
                            timestamp: { type: "string" }
                        }
                    }
                }
            }
        }
    }
};