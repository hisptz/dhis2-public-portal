import { NextFunction, Request, Response } from 'express';
import logger from '@/logging';
import { getChannel } from '@/rabbit/connection';
import { getQueueNames } from '@/variables/queue-names';
import { Operation } from 'express-openapi';

export interface FailedMessage {
    messageId?: string;
    queueType: string;
    configId: string;
    retryCount: number;
    queue: string;
    failureReason: any;
    errorMessage: string;
    errorStack?: string;
    errorTimestamp: string;
    originalData: any;
}

export interface FailedQueueResponse {
    configId: string;
    totalFailedMessages: number;
    messages: FailedMessage[];
    retrievedAt: string;
}

export const GET: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        if (!configId) {
            return res.status(400).json({
                error: 'Configuration ID is required',
                message: 'Please provide a valid configuration ID in the URL parameters'
            });
        }

        logger.info(`Fetching failed queue details for config: ${configId}`);

        const channel = getChannel();
        if (!channel) {
            throw new Error('RabbitMQ channel not available');
        }

        const queueNames = getQueueNames(configId);
        const failedQueueName = queueNames.failed;

        const queueInfo = await channel.checkQueue(failedQueueName);
        const totalFailedMessages = queueInfo.messageCount;

        if (totalFailedMessages === 0) {
            return res.json({
                configId,
                totalFailedMessages: 0,
                messages: [],
                retrievedAt: new Date().toISOString()
            });
        }

        const messages: FailedMessage[] = [];
        let retrievedCount = 0;
        const maxMessages = Math.min(Number(limit), 100);  

        try {
            while (retrievedCount < maxMessages && retrievedCount < totalFailedMessages) {
                try {
                    const msg = await channel.get(failedQueueName, { noAck: false });
                    if (!msg) break;

                    const messageContent = JSON.parse(msg.content.toString());
                    const headers = msg.properties.headers || {};
                    logger.debug('Failed message headers:', headers);
                        logger.debug('Failed message content:', messageContent);

                    const failedMessage: FailedMessage = {
                        messageId: msg.properties.messageId,
                        queue: headers['x-death[queue]'] || 'unknown',
                        queueType: headers['x-queue-type'] || 'unknown',
                        configId: messageContent.configId || configId,
                        retryCount: parseInt(headers['x-retry-count'] || '0'),
                        failureReason: headers['x-failure-reason'] ? JSON.parse(headers['x-failure-reason']) : null,
                        errorMessage: headers['x-error-message'] || 'Unknown error',
                        errorStack: headers['x-error-stack'],
                        errorTimestamp: headers['x-error-timestamp'] || msg.properties.timestamp,
                        originalData: messageContent
                    };

                    messages.push(failedMessage);
                    
                    // Requeue the message back to failed queue to maintain it
                    await channel.sendToQueue(failedQueueName, msg.content, msg.properties);
                    channel.ack(msg);
                    
                    retrievedCount++;
                } catch (msgError) {
                    logger.warn('Error processing failed message:', msgError);
                    break;
                }
            }
        } catch (error) {
            logger.warn('Error retrieving failed messages:', error);
        }

        const response: FailedQueueResponse = {
            configId,
            totalFailedMessages,
            messages: messages.slice(Number(offset), Number(offset) + Number(limit)),
            retrievedAt: new Date().toISOString()
        };

        logger.info(`Retrieved ${messages.length} failed messages for config: ${configId}`);
        res.json(response);

    } catch (error: any) {
        logger.error('Error fetching failed queue details:', error);
        res.status(500).json({
            error: 'Failed to fetch failed queue details',
            message: error.message || 'An unexpected error occurred',
            configId: req.params.id
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
                error: 'Configuration ID is required'
            });
        }

        logger.info(`Clearing failed queue for config: ${configId}`);

        const channel = getChannel();
        if (!channel) {
            throw new Error('RabbitMQ channel not available');
        }

        const queueNames = getQueueNames(configId);
        const failedQueueName = queueNames.failed;

        // Purge the failed queue
        const result = await channel.purgeQueue(failedQueueName);
        
        logger.info(`Cleared ${result.messageCount} messages from failed queue for config: ${configId}`);
        
        res.json({
            message: 'Failed queue cleared successfully',
            configId,
            clearedMessages: result.messageCount,
            clearedAt: new Date().toISOString()
        });

    } catch (error: any) {
        logger.error('Error clearing failed queue:', error);
        res.status(500).json({
            error: 'Failed to clear failed queue',
            message: error.message || 'An unexpected error occurred',
            configId: req.params.id
        });
    }
};

GET.apiDoc = {
    summary: "Get failed queue details for a configuration",
    description: "Retrieves detailed information about failed messages in the failed queue",
    operationId: "getFailedQueueDetails",
    tags: ["MONITORING"],
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
            name: "limit",
            schema: { type: "number", default: 50 },
            description: "Maximum number of messages to retrieve"
        },
        {
            in: "query",
            name: "offset",
            schema: { type: "number", default: 0 },
            description: "Number of messages to skip"
        }
    ],
    responses: {
        "200": {
            description: "Failed queue details retrieved successfully"
        },
        "400": {
            description: "Bad request - missing configuration ID"
        },
        "500": {
            description: "Internal server error"
        }
    }
};

DELETE.apiDoc = {
    summary: "Clear failed queue for a configuration",
    description: "Removes all failed messages from the failed queue",
    operationId: "clearFailedQueue",
    tags: ["MONITORING"],
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
            description: "Failed queue cleared successfully"
        },
        "400": {
            description: "Bad request - missing configuration ID"
        },
        "500": {
            description: "Internal server error"
        }
    }
};