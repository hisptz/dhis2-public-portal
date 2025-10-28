import logger from "@/logging";
import { NextFunction, Request, Response } from "express";
import { Operation } from "express-openapi";
import { 
    getConfigQueueStats,
    purgeConfigQueues,
    deleteConfigQueues,
    initializeQueuesFromDatastore,
    createQueuesForConfig
} from "@/rabbit/queue-manager";
 
export const GET: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const configId = req.params.id; // Use 'id' instead of 'configId' to match the file path {id}
        logger.info(`API request: Get queue stats for configId: ${configId}`);
        
        if (!configId) {
            return res.status(400).json({
                success: false,
                error: "configId is required",
                timestamp: new Date().toISOString()
            });
        }
        
        // Temporarily return simple response for debugging
        // const stats = await getConfigQueueStats(configId);
        
        res.json({
            success: true,
            configId,
            message: "Queue stats endpoint working",
            // stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error(`Failed to get queue stats for ${req.params.id}:`, error);
        
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

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const configId = req.params.id;  
        const { action } = req.body;

        logger.info(`API request: ${action} for configId: ${configId}`);

        let result;
        switch (action) {
            case 'initialize':
                result = await initializeQueuesFromDatastore(configId);
                res.json({
                    success: true,
                    configId,
                    config: result.config.id,
                    queues: result.queues,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'create':
                const queueNames = await createQueuesForConfig(configId);
                res.json({
                    success: true,
                    configId,
                    queues: queueNames,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'purge':
                result = await purgeConfigQueues(configId);
                res.json({
                    success: true,
                    ...result
                });
                break;

            default:
                res.status(400).json({
                    success: false,
                    error: `Unknown action: ${action}. Supported actions: initialize, create, purge`,
                    timestamp: new Date().toISOString()
                });
        }
    } catch (error) {
        logger.error(`Failed to ${req.body.action} queues for ${req.params.id}:`, error);
        
        const statusCode = (error as Error).message.includes('not found') ? 404 : 500;
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        res.status(statusCode).json({
            success: false,
            configId: req.params.id,
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
};

export const DELETE: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        logger.info(`DELETE API request for configId: ${configId}`);
        
        const result = await deleteConfigQueues(configId);
        
        res.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to delete queues for ${req.params.id}: ${errorMessage}`);
        
        res.status(500).json({
            success: false,
            configId: req.params.id,
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
};

GET.apiDoc = {
    summary: "Get queue statistics for a config",
    description: "Returns message counts and consumer information for all queues of a specific config",
    operationId: "getConfigQueueStats",
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
            description: "Queue statistics retrieved successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            configId: { type: "string" },
                            queues: { type: "object" },
                            timestamp: { type: "string" }
                        }
                    }
                }
            }
        },
        "500": {
            description: "Failed to get queue statistics"
        }
    }
};

POST.apiDoc = {
    summary: "Perform queue operations for a config",
    description: "Initialize, create, or purge queues for a specific configuration",
    operationId: "manageConfigQueues",
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
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        action: {
                            type: "string",
                            enum: ["initialize", "create", "purge"],
                            description: "Action to perform on queues"
                        }
                    },
                    required: ["action"]
                }
            }
        }
    },
    responses: {
        "200": {
            description: "Queue operation completed successfully"
        },
        "400": {
            description: "Invalid action specified"
        },
        "404": {
            description: "Configuration not found"
        },
        "500": {
            description: "Failed to perform queue operation"
        }
    }
};

DELETE.apiDoc = {
    summary: "Delete all queues for a config",
    description: "Permanently deletes all queues of a specific config",
    operationId: "deleteConfigQueues",
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
            description: "Queues deleted successfully"
        },
        "500": {
            description: "Failed to delete queues"
        }
    }
};