import { NextFunction, Request, Response } from 'express';
import { Operation } from 'express-openapi';
import { getChannel } from '@/rabbit/connection';
import { getQueueNames } from '@/variables/queue-names';
import axios from 'axios';

export const GET: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        const includeMessages = req.query.includeMessages === 'true';
        const filterByQueue = req.query.queue as string;
        const onlyQueues = req.query.onlyQueues === 'true';
        const limit = parseInt(req.query.limit as string) || (onlyQueues ? 50 : 50);
        const offset = parseInt(req.query.offset as string) || 0;

        if (!configId) {
            return res.status(400).json({
                success: false,
                error: "Configuration ID is required",
                timestamp: new Date().toISOString()
            });
        }

        const queueNames = getQueueNames(configId);
        const failedQueueName = queueNames.failed;

        const rabbitMQConfig = {
            baseURL: process.env.RABBITMQ_HOST || 'http://localhost:15672',
            username: process.env.RABBITMQ_USER || 'guest',
            password: process.env.RABBITMQ_PASS || 'guest',
            vhost: process.env.RABBITMQ_VHOST || '%2F'
        };

        const baseURL = rabbitMQConfig.baseURL;
        const auth = Buffer.from(`${rabbitMQConfig.username}:${rabbitMQConfig.password}`).toString('base64');

        let totalFailedMessages = 0;
        let messages: any[] = [];
        let sourceQueues: Set<string> = new Set();
        let sourceQueueCounts: Map<string, number> = new Map();

        try {
            const queueInfoResponse = await axios.get(
                `${baseURL}/api/queues/${rabbitMQConfig.vhost}/${failedQueueName}`,
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            totalFailedMessages = queueInfoResponse.data.messages || 0;

            if (totalFailedMessages > 0 && (includeMessages || onlyQueues)) {
                const fetchCount = onlyQueues ?
                    Math.min(50, totalFailedMessages) :
                    Math.min(offset + limit * 2, totalFailedMessages);

                const messagesResponse = await axios.post(
                    `${baseURL}/api/queues/${rabbitMQConfig.vhost}/${failedQueueName}/get`,
                    {
                        count: fetchCount,
                        ackmode: "ack_requeue_true", // Requeue messages to avoid consumption
                        encoding: "auto",
                        truncate: 50000
                    },
                    {
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const rawMessages = messagesResponse.data;

                for (let i = 0; i < rawMessages.length; i++) {
                    const rawMsg = rawMessages[i];
                    const headers = rawMsg.properties?.headers || {};

                    const xDeath = headers['x-death'];
                    let sourceQueue = null;

                    if (xDeath && Array.isArray(xDeath) && xDeath.length > 0) {
                        const deathInfo = xDeath[0];
                        sourceQueue = deathInfo.queue;
                    }


                    if (sourceQueue) {
                        sourceQueues.add(sourceQueue);
                        sourceQueueCounts.set(sourceQueue, (sourceQueueCounts.get(sourceQueue) || 0) + 1);
                    }

                    if (includeMessages || !onlyQueues) {
                        let payload;
                        try {
                            payload = JSON.parse(rawMsg.payload);
                        } catch {
                            payload = rawMsg.payload;
                        }

                        let deathTimestamp = null;
                        let deathReason = null;
                        let retryCount = null;

                        if (xDeath && Array.isArray(xDeath) && xDeath.length > 0) {
                            const deathInfo = xDeath[0];
                            retryCount = deathInfo.count;
                            deathReason = deathInfo.reason;
                            if (deathInfo.time) {
                                deathTimestamp = new Date(deathInfo.time * 1000).toISOString();
                            }
                        }

                        const messageDetails = {
                            messageId: rawMsg.properties?.message_id || `msg-${i + 1}`,
                            sourceQueue,
                            retryCount,
                            deathReason,
                            deathTimestamp,
                            headers: {
                                'x-axios-code': headers['x-axios-code'],
                                'x-axios-status': headers['x-axios-status'],
                                'x-axios-url': headers['x-axios-url'],
                                'x-death': headers['x-death'],
                                'x-error-message': headers['x-error-message'],
                                'x-failure-reason': headers['x-failure-reason'],
                                'x-retry-timestamp': headers['x-retry-timestamp']
                            },
                            payload,
                            retrievedAt: new Date().toISOString()
                        };

                        if (!filterByQueue || sourceQueue === filterByQueue) {
                            messages.push(messageDetails);
                        }
                    }

                    if (onlyQueues && sourceQueues.size >= 5) {
                        console.log(`Found all 5 possible source queues, stopping early at message ${i + 1}`);
                        break;
                    }
                }

                if (!onlyQueues && messages.length > 0) {
                    const totalMessages = messages.length;
                    messages = messages.slice(offset, offset + limit);

                    console.log(`Pagination applied: showing ${messages.length} messages (${offset + 1}-${offset + messages.length} of ${totalMessages} filtered)`);
                }
            }

        } catch (apiError: any) {
            console.warn(`RabbitMQ Management API error for config ${configId}:`, apiError.message);
            const channel = getChannel();
            if (channel) {
                try {
                    const queueInfo = await channel.checkQueue(failedQueueName);
                    totalFailedMessages = queueInfo.messageCount;
                    console.log(`Fallback: Found ${totalFailedMessages} messages in failed queue`);
                } catch (queueError) {
                    console.warn(`Failed queue does not exist or error checking queue:`, queueError);
                }
            }
        }

        const responseData: any = {
            configId,
            totalFailedMessages,
            retrievedAt: new Date().toISOString()
        };

        if (onlyQueues) {
            responseData.sourceQueues = Array.from(sourceQueues);
            responseData.sourceQueueCount = sourceQueues.size;
            responseData.sourceQueueCounts = Object.fromEntries(sourceQueueCounts);
        } else {
            responseData.messages = messages;
            if (sourceQueues.size > 0) {
                responseData.sourceQueues = Array.from(sourceQueues);
                responseData.sourceQueueCounts = Object.fromEntries(sourceQueueCounts);
            }

            // Add pagination metadata
            if (includeMessages && !onlyQueues) {
                responseData.pagination = {
                    limit,
                    offset,
                    currentPageSize: messages.length,
                    hasNextPage: (offset + limit) < totalFailedMessages,
                    hasPreviousPage: offset > 0,
                    totalPages: Math.ceil(totalFailedMessages / limit),
                    currentPage: Math.floor(offset / limit) + 1
                };
            }
        }

        res.json({
            success: true,
            message: onlyQueues ?
                `Found ${sourceQueues.size} unique source queues from ${totalFailedMessages} failed messages` :
                `Found ${totalFailedMessages} failed messages`,
            data: responseData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in failed-queue GET:', error);
        res.status(500).json({
            success: false,
            configId: req.params.id,
            error: "Internal server error",
            message: 'Failed to fetch failed queue details',
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

        if (!configId) {
            return res.status(400).json({
                success: false,
                error: "Configuration ID is required",
                timestamp: new Date().toISOString()
            });
        }

        // Clear the failed queue
        const channel = getChannel();
        let clearedMessages = 0;

        if (channel) {
            try {
                const queueNames = getQueueNames(configId);
                const failedQueueName = queueNames.failed;

                const result = await channel.purgeQueue(failedQueueName);
                clearedMessages = result.messageCount;
                console.log(`Cleared ${clearedMessages} messages from failed queue: ${failedQueueName}`);
            } catch (queueError) {
                console.warn(`Failed to clear queue for config ${configId}:`, queueError);
            }
        } else {
            console.log('RabbitMQ channel not available - no messages to clear');
        }

        res.json({
            success: true,
            message: `Cleared ${clearedMessages} failed messages`,
            data: {
                configId,
                clearedMessages,
                clearedAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in failed-queue DELETE:', error);
        res.status(500).json({
            success: false,
            configId: req.params.id,
            error: "Internal server error",
            message: 'Failed to clear failed queue',
            timestamp: new Date().toISOString()
        });
    }
};

GET.apiDoc = {
    summary: "Get failed queue messages and source queue information",
    description: "Retrieves failed messages from the RabbitMQ dead letter queue for a specific configuration. Supports different modes: full message details, source queues only, or filtered by queue type. Provides pagination and detailed error information for troubleshooting.",
    operationId: "getFailedQueueMessages",
    tags: ["FAILED QUEUE"],
    parameters: [
        {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Configuration ID"
        },
        {
            in: "query",
            name: "includeMessages",
            schema: { type: "boolean", default: false },
            description: "Whether to include full message details in the response"
        },
        {
            in: "query",
            name: "onlyQueues",
            schema: { type: "boolean", default: false },
            description: "Return only source queue information without message details (lightweight mode)"
        },
        {
            in: "query",
            name: "queue",
            schema: { type: "string" },
            description: "Filter messages by specific source queue name"
        },
        {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
            description: "Maximum number of messages to return per page"
        },
        {
            in: "query",
            name: "offset",
            schema: { type: "integer", minimum: 0, default: 0 },
            description: "Number of messages to skip for pagination"
        }
    ],
    responses: {
        "200": {
            description: "Failed queue information retrieved successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean", example: true },
                            message: { type: "string", example: "Found 5 failed messages" },
                            data: {
                                type: "object",
                                properties: {
                                    configId: { type: "string", example: "config-123" },
                                    totalFailedMessages: { type: "integer", example: 5 },
                                    retrievedAt: { type: "string", format: "date-time" },
                                    sourceQueues: {
                                        type: "array",
                                        items: { type: "string" },
                                        example: ["config-123-data-download-queue", "config-123-data-upload-queue"],
                                        description: "List of source queues that have failed messages"
                                    },
                                    sourceQueueCounts: {
                                        type: "object",
                                        additionalProperties: { type: "integer" },
                                        example: {
                                            "config-123-data-download-queue": 3,
                                            "config-123-data-upload-queue": 2
                                        },
                                        description: "Count of failed messages per source queue"
                                    },
                                    messages: {
                                        type: "array",
                                        description: "Detailed failed message information (only when includeMessages=true)",
                                        items: {
                                            type: "object",
                                            properties: {
                                                messageId: { type: "string", example: "msg-1" },
                                                sourceQueue: { type: "string", example: "config-123-data-download-queue" },
                                                retryCount: { type: "integer", example: 3 },
                                                deathReason: { type: "string", example: "rejected" },
                                                deathTimestamp: { type: "string", format: "date-time" },
                                                headers: {
                                                    type: "object",
                                                    properties: {
                                                        "x-error-message": { type: "string", example: "HTTP 400 Bad Request" },
                                                        "x-axios-status": { type: "string", example: "400" },
                                                        "x-axios-url": { type: "string", example: "https://dhis2.example.com/api/dataValueSets" },
                                                        "x-failure-reason": { type: "string", example: "Invalid data format" }
                                                    }
                                                },
                                                payload: {
                                                    type: "object",
                                                    description: "Original message payload that failed to process"
                                                },
                                                retrievedAt: { type: "string", format: "date-time" }
                                            }
                                        }
                                    },
                                    pagination: {
                                        type: "object",
                                        description: "Pagination information (only when includeMessages=true and onlyQueues=false)",
                                        properties: {
                                            limit: { type: "integer", example: 50 },
                                            offset: { type: "integer", example: 0 },
                                            currentPageSize: { type: "integer", example: 5 },
                                            hasNextPage: { type: "boolean", example: false },
                                            hasPreviousPage: { type: "boolean", example: false },
                                            totalPages: { type: "integer", example: 1 },
                                            currentPage: { type: "integer", example: 1 }
                                        }
                                    }
                                }
                            },
                            timestamp: { type: "string", format: "date-time" }
                        }
                    }
                }
            }
        },
        "400": {
            description: "Bad request - missing or invalid configuration ID",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean", example: false },
                            error: { type: "string", example: "Configuration ID is required" },
                            timestamp: { type: "string", format: "date-time" }
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
                            success: { type: "boolean", example: false },
                            configId: { type: "string", example: "config-123" },
                            error: { type: "string", example: "Internal server error" },
                            message: { type: "string", example: "Failed to fetch failed queue details" },
                            timestamp: { type: "string", format: "date-time" }
                        }
                    }
                }
            }
        }
    }
};

DELETE.apiDoc = {
    summary: "Clear all failed messages from the queue",
    description: "Purges all failed messages from the RabbitMQ dead letter queue for a specific configuration. This operation is irreversible and will permanently remove all failed messages.",
    operationId: "clearFailedQueue",
    tags: ["FAILED QUEUE"],
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
            description: "Failed queue cleared successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean", example: true },
                            message: { type: "string", example: "Cleared 5 failed messages" },
                            data: {
                                type: "object",
                                properties: {
                                    configId: { type: "string", example: "config-123" },
                                    clearedMessages: { type: "integer", example: 5 },
                                    clearedAt: { type: "string", format: "date-time" }
                                }
                            },
                            timestamp: { type: "string", format: "date-time" }
                        }
                    }
                }
            }
        },
        "400": {
            description: "Bad request - missing configuration ID",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean", example: false },
                            error: { type: "string", example: "Configuration ID is required" },
                            timestamp: { type: "string", format: "date-time" }
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
                            success: { type: "boolean", example: false },
                            configId: { type: "string", example: "config-123" },
                            error: { type: "string", example: "Internal server error" },
                            message: { type: "string", example: "Failed to clear failed queue" },
                            timestamp: { type: "string", format: "date-time" }
                        }
                    }
                }
            }
        }
    }
};

