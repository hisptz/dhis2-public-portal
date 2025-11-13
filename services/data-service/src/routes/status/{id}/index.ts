import { NextFunction, Request, Response } from 'express';
import { Operation } from 'express-openapi';
import logger from '@/logging';
import { getMultipleQueueStatus, getSystemHealth } from '@/services/status';
import { getQueueNames } from '@/variables/queue-names';
import { getAllProgress, buildProcessStatus } from '@/services/simple-progress-tracker';

export const GET: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        
        if (!configId) {
            return res.status(400).json({
                success: false,
                error: "Configuration ID is required",
                timestamp: new Date().toISOString()
            });
        }


        const queueNames = getQueueNames(configId);
        const allQueueNames = [
            queueNames.metadataDownload,
            queueNames.metadataUpload,
            queueNames.dataDownload,
            queueNames.dataUpload,
            queueNames.failed  
        ];

         const queueStatuses = await getMultipleQueueStatus(allQueueNames, configId);
        const health = await getSystemHealth([configId]);

        const statusByType = {
            metadataDownload: queueStatuses.find((q: any) => q.queue === queueNames.metadataDownload),
            metadataUpload: queueStatuses.find((q: any) => q.queue === queueNames.metadataUpload),
            dataDownload: queueStatuses.find((q: any) => q.queue === queueNames.dataDownload),
            dataUpload: queueStatuses.find((q: any) => q.queue === queueNames.dataUpload),
            dlq: queueStatuses.find((q: any) => q.queue === queueNames.failed),  
        };

        // Get progress data for simple process status
        const progressData = await getAllProgress(configId);
        const failedCount = statusByType.dlq?.messages || 0;

        // Build simple process status for the ProcessSection components
        const processes = {
            metadataDownload: buildProcessStatus('metadata-download', progressData, failedCount),
            metadataUpload: buildProcessStatus('metadata-upload', progressData, failedCount),
            dataDownload: buildProcessStatus('data-download', progressData, failedCount),
            dataUpload: buildProcessStatus('data-upload', progressData, failedCount)
        };

        res.json({
            success: true,
            configId,
            queues: statusByType,        // Your existing queue data (for other parts of the app)
            processes,                   // NEW: Simple process data (for ProcessSection components)
            health,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        logger.error(`Failed to get status for config ${req.params.id}:`, error);
        
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
    summary: "Get queue status for a configuration",
    description: "Returns detailed status information for all queues associated with a specific configuration",
    operationId: "getConfigStatus",
    tags: ["STATUS"],
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
            description: "Configuration status retrieved successfully",
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
                                    metadataDownload: { 
                                        type: "object",
                                        properties: {
                                            queue: { type: "string" },
                                            messages: { type: "number" },
                                            messages_ready: { type: "number" },
                                            messages_unacknowledged: { type: "number" },
                                            dlq_messages: { type: "number" },
                                            status: { type: "string" },
                                            last_activity: { type: "string" },
                                            consumers: { type: "number" }
                                        }
                                    },
                                    metadataUpload: { type: "object" },
                                    dataDownload: { type: "object" },
                                    dataUpload: { type: "object" }
                                }
                            },
                            health: {
                                type: "object",
                                properties: {
                                    healthy: { type: "boolean" },
                                    totalQueues: { type: "number" },
                                    activeQueues: { type: "number" },
                                    failedQueues: { type: "number" },
                                    issues: { 
                                        type: "array",
                                        items: { type: "string" }
                                    }
                                }
                            },
                            timestamp: { type: "string" }
                        }
                    }
                }
            }
        },
        "400": {
            description: "Bad request - missing configuration ID"
        },
        "500": {
            description: "Internal server error"
        }
    }
};