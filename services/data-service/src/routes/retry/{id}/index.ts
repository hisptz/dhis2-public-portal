 
import { NextFunction, Request, Response } from 'express';
import logger from '@/logging';
import { Operation } from 'express-openapi';
import { getQueueNames } from '@/variables/queue-names';
import { getChannel } from '@/rabbit/connection';
import axios from 'axios';

async function consumeFailedMessagesFromRabbitMQ(configId: string, limit: number = 50): Promise<any[]> {
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

    try {
        const response = await axios.post(
            `${baseURL}/api/queues/${rabbitMQConfig.vhost}/${failedQueueName}/get`,
            {
                count: limit,
                ackmode: "ack_requeue_false",  
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

        return response.data || [];
    } catch (error: any) {
        logger.error(`Error consuming failed messages:`, error);
        throw new Error(`Failed to consume messages: ${error.message}`);
    }
}

async function retryMessage(message: any, configId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const channel = getChannel();
        if (!channel) {
            throw new Error('RabbitMQ channel not available');
        }

        // Determine the source queue from the message headers
        const headers = message.properties?.headers || {};
        const xDeath = headers['x-death'];
        let sourceQueue = null;
        
        if (xDeath && Array.isArray(xDeath) && xDeath.length > 0) {
            sourceQueue = xDeath[0].queue;
        }

        if (!sourceQueue) {
            throw new Error('Cannot determine source queue for message');
        }

        // Republish the message to its original queue
        const messageBuffer = Buffer.from(message.payload);
        const success = channel.sendToQueue(sourceQueue, messageBuffer, {
            persistent: true,
            headers: {
                ...headers,
                'x-retry-attempt': true,
                'x-retry-timestamp': new Date().toISOString()
            }
        });

        if (!success) {
            throw new Error('Failed to republish message');
        }

        logger.info(`Successfully retried message to queue: ${sourceQueue}`);
        return { success: true };
    } catch (error: any) {
        logger.error(`Error retrying message:`, error);
        
        // If retry fails, we need to put the message back in the failed queue
        try {
            const channel = getChannel();
            const queueNames = getQueueNames(configId);
            const failedQueueName = queueNames.failed;
            
            if (channel) {
                const messageBuffer = Buffer.from(message.payload);
                channel.sendToQueue(failedQueueName, messageBuffer, message.properties);
                logger.info(`Requeued failed retry message back to failed queue: ${failedQueueName}`);
            }
        } catch (requeueError: any) {
            logger.error(`Failed to requeue message to failed queue:`, requeueError);
        }
        
        return { success: false, error: error.message };
    }
}

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId } = req.params;
        const { maxRetries = 10 } = req.body;

        if (!configId) {
            return res.status(400).json({
                error: 'Configuration ID is required',
                message: 'Please provide a valid configuration ID in the URL parameters'
            });
        }

        logger.info(`Retry request received for config: ${configId}`, { maxRetries });

        // Get and consume failed messages
        const failedMessages = await consumeFailedMessagesFromRabbitMQ(configId, maxRetries);
        
        if (failedMessages.length === 0) {
            return res.json({
                success: true,
                message: 'No failed messages to retry',
                configId,
                results: {
                    totalAttempted: 0,
                    successfulRetries: 0,
                    failedRetries: 0,
                }
            });
        }

        // Retry each message
        let successfulRetries = 0;
        let failedRetries = 0;
        const retryResults = [];

        for (const message of failedMessages) {
            const result = await retryMessage(message, configId);
            if (result.success) {
                successfulRetries++;
            } else {
                failedRetries++;
            }
            
            retryResults.push({
                success: result.success,
                error: result.error
            });
        }

        logger.info(`Retry operation completed for config: ${configId}`, {
            totalAttempted: failedMessages.length,
            successfulRetries,
            failedRetries,
        });

        res.json({
            success: successfulRetries > 0,
            message: `Retry operation completed. ${successfulRetries}/${failedMessages.length} messages retried successfully.`,
            configId,
            results: {
                totalAttempted: failedMessages.length,
                successfulRetries,
                failedRetries,
                details: retryResults,
            },
        });

    } catch (error: any) {
        logger.error(`Error in retry endpoint for config ${req.params.id}:`, error);
        
        res.status(500).json({
            error: 'Retry operation failed',
            message: error.message || 'An unexpected error occurred during retry operation',
            configId: req.params.id
        });
    }
};

// API Documentation
POST.apiDoc = {
    summary: "Retry failed operations for a configuration",
    description: "Retry failed queue operations based on different criteria",
    operationId: "retryFailedOperations",
    tags: ["RETRY"],
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
        required: false,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        retryType: {
                            type: "string",
                            enum: ["all", "specific", "process-type", "custom"],
                            default: "all",
                            description: "Type of retry operation to perform"
                        },
                        messageIds: {
                            type: "array",
                            items: { type: "string" },
                            description: "Specific message IDs to retry (required for retryType='specific')"
                        },
                        processType: {
                            type: "string",
                            enum: ["data-upload", "metadata-upload", "data-download", "metadata-download"],
                            description: "Process type to retry (required for retryType='process-type')"
                        },
                        sourceQueue: {
                            type: "string",
                            description: "Source queue name filter (optional for retryType='custom')"
                        },
                        maxRetries: {
                            type: "integer",
                            default: 50,
                            minimum: 1,
                            maximum: 1000,
                            description: "Maximum number of messages to retry"
                        }
                    }
                }
            }
        }
    },
    responses: {
        "200": {
            description: "Retry operation completed",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            message: { type: "string" },
                            configId: { type: "string" },
                            results: {
                                type: "object",
                                properties: {
                                    totalAttempted: { type: "integer" },
                                    successfulRetries: { type: "integer" },
                                    failedRetries: { type: "integer" },
                                    details: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                messageId: { type: "string" },
                                                success: { type: "boolean" },
                                                processType: { type: "string" },
                                                sourceQueue: { type: "string" },
                                                error: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "400": {
            description: "Bad request - invalid parameters"
        },
        "500": {
            description: "Internal server error during retry operation"
        }
    }
};