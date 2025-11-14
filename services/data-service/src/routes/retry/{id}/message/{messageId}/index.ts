 
import { NextFunction, Request, Response } from 'express';
import logger from '@/logging';
import { Operation } from 'express-openapi';
import { getQueueNames } from '@/variables/queue-names';
import { getChannel } from '@/rabbit/connection';
import axios from 'axios';
  
async function findAndRetrySpecificMessage(configId: string, targetMessageId: string): Promise<{ success: boolean; message: string; error?: string }> {
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
        // First, peek at messages to find the target message
        const peekResponse = await axios.post(
            `${baseURL}/api/queues/${rabbitMQConfig.vhost}/${failedQueueName}/get`,
            {
                count: 100, 
                ackmode: "ack_requeue_true",  
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

        const messages = peekResponse.data || [];
        let targetMessageIndex = -1;
        let targetMessage = null;

        // Find the target message by ID
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const msgId = msg.properties?.message_id || `msg-${i + 1}`;
            
            if (msgId === targetMessageId) {
                targetMessageIndex = i;
                targetMessage = msg;
                break;
            }
        }

        if (!targetMessage) {
            return {
                success: false,
                message: `Message with ID '${targetMessageId}' not found in failed queue`,
                error: 'Message not found'
            };
        }

        // Now consume messages up to and including the target message
        const consumeResponse = await axios.post(
            `${baseURL}/api/queues/${rabbitMQConfig.vhost}/${failedQueueName}/get`,
            {
                count: targetMessageIndex + 1, 
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

        const consumedMessages = consumeResponse.data || [];
        
        // The target message should be the last one consumed
        const actualTargetMessage = consumedMessages[consumedMessages.length - 1];
        
        if (!actualTargetMessage) {
            return {
                success: false,
                message: `Failed to consume target message '${targetMessageId}'`,
                error: 'Message consumption failed'
            };
        }

        // Requeue all messages except the target one
        const channel = getChannel();
        if (!channel) {
            throw new Error('RabbitMQ channel not available');
        }

        for (let i = 0; i < consumedMessages.length - 1; i++) {
            const msg = consumedMessages[i];
            const messageBuffer = Buffer.from(msg.payload);
            channel.sendToQueue(failedQueueName, messageBuffer, msg.properties);
        }

        // Now retry the target message
        const retryResult = await retryMessage(actualTargetMessage, configId);
        
        if (retryResult.success) {
            return {
                success: true,
                message: `Message '${targetMessageId}' retried successfully`
            };
        } else {
            // Put the target message back in failed queue if retry failed
            const messageBuffer = Buffer.from(actualTargetMessage.payload);
            channel.sendToQueue(failedQueueName, messageBuffer, actualTargetMessage.properties);
            
            return {
                success: false,
                message: `Failed to retry message '${targetMessageId}'`,
                error: retryResult.error
            };
        }

    } catch (error: any) {
        logger.error(`Error in specific message retry:`, error);
        return {
            success: false,
            message: `Error retrying message '${targetMessageId}'`,
            error: error.message
        };
    }
}

async function getFailedMessageById(configId: string, targetMessageId: string): Promise<any | null> {
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
        // Peek at messages to find the target message
        const response = await axios.post(
            `${baseURL}/api/queues/${rabbitMQConfig.vhost}/${failedQueueName}/get`,
            {
                count: 100,  
                ackmode: "ack_requeue_true",  
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

        const messages = response.data || [];

        // Find the target message by ID
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const msgId = msg.properties?.message_id || `msg-${i + 1}`;
            
            if (msgId === targetMessageId) {
                let payload;
                try {
                    payload = JSON.parse(msg.payload);
                } catch {
                    payload = msg.payload;
                }

                const headers = msg.properties?.headers || {};
                const xDeath = headers['x-death'];
                let sourceQueue = null;
                let retryCount = null;
                let deathReason = null;
                let deathTimestamp = null;
                
                if (xDeath && Array.isArray(xDeath) && xDeath.length > 0) {
                    const deathInfo = xDeath[0];
                    sourceQueue = deathInfo.queue;
                    retryCount = deathInfo.count;
                    deathReason = deathInfo.reason;
                    if (deathInfo.time) {
                        deathTimestamp = new Date(deathInfo.time * 1000).toISOString();
                    }
                }

                return {
                    messageId: msgId,
                    sourceQueue,
                    retryCount,
                    deathReason,
                    deathTimestamp,
                    headers,
                    payload,
                    retrievedAt: new Date().toISOString()
                };
            }
        }

        return null;
    } catch (error: any) {
        logger.error(`Error getting failed message by ID:`, error);
        throw new Error(`Failed to get message: ${error.message}`);
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

        logger.info(`Successfully retried specific message to queue: ${sourceQueue}`);
        return { success: true };
    } catch (error: any) {
        logger.error(`Error retrying specific message:`, error);
        return { success: false, error: error.message };
    }
}

export const POST: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId, messageId } = req.params;

        if (!configId || !messageId) {
            return res.status(400).json({
                error: 'Missing required parameters',
                message: 'Both configuration ID and message ID are required'
            });
        }

        logger.info(`Individual message retry request for config: ${configId}, message: ${messageId}`);

        const result = await findAndRetrySpecificMessage(configId, messageId);

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                configId,
                messageId,
            });
        } else {
            res.status(result.error === 'Message not found' ? 404 : 500).json({
                success: false,
                message: result.message,
                error: result.error,
                configId,
                messageId,
            });
        }

    } catch (error: any) {
        logger.error(`Error in individual message retry endpoint:`, {
            configId: req.params.id,
            messageId: req.params.messageId,
            error: error.message,
        });
        
        res.status(500).json({
            error: 'Message retry failed',
            message: error.message || 'An unexpected error occurred during message retry',
            configId: req.params.id,
            messageId: req.params.messageId,
        });
    }
};

export const GET: Operation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: configId, messageId } = req.params;

        if (!configId || !messageId) {
            return res.status(400).json({
                error: 'Missing required parameters',
                message: 'Both configuration ID and message ID are required'
            });
        }

        logger.info(`Getting failed message details for config: ${configId}, message: ${messageId}`);

        const message = await getFailedMessageById(configId, messageId);
        
        if (!message) {
            return res.status(404).json({
                error: 'Message not found',
                message: `No failed message found with ID: ${messageId} for config: ${configId}`
            });
        }

        res.json({
            success: true,
            message: 'Failed message details retrieved successfully',
            configId,
            messageId,
            details: message,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        logger.error(`Error in get message details endpoint:`, {
            configId: req.params.id,
            messageId: req.params.messageId,
            error: error.message,
        });
        
        res.status(500).json({
            error: 'Failed to get message details',
            message: error.message || 'An unexpected error occurred while retrieving message details',
            configId: req.params.id,
            messageId: req.params.messageId,
        });
    }
};

// API Documentation
POST.apiDoc = {
    summary: "Retry a specific failed message",
    description: "Retry a single failed message by its ID",
    operationId: "retrySpecificMessage",
    tags: ["RETRY"],
    parameters: [
        {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Configuration ID"
        },
        {
            in: "path",
            name: "messageId",
            required: true,
            schema: { type: "string" },
            description: "Message ID to retry"
        }
    ],
    responses: {
        "200": {
            description: "Message retried successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            message: { type: "string" },
                            configId: { type: "string" },
                            messageId: { type: "string" },
                            processType: { type: "string" },
                            sourceQueue: { type: "string" }
                        }
                    }
                }
            }
        },
        "404": {
            description: "Message not found"
        },
        "500": {
            description: "Message retry failed"
        }
    }
};

GET.apiDoc = {
    summary: "Get failed message details",
    description: "Retrieve details of a specific failed message",
    operationId: "getFailedMessageDetails",
    tags: ["RETRY"],
    parameters: [
        {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Configuration ID"
        },
        {
            in: "path",
            name: "messageId",
            required: true,
            schema: { type: "string" },
            description: "Message ID to get details for"
        }
    ],
    responses: {
        "200": {
            description: "Message details retrieved successfully",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            message: { type: "string" },
                            configId: { type: "string" },
                            messageId: { type: "string" },
                            details: {
                                type: "object",
                                properties: {
                                    processType: { type: "string" },
                                    sourceQueue: { type: "string" },
                                    errorMessage: { type: "string" },
                                    failureReason: { type: "string" },
                                    retryCount: { type: "integer" },
                                    payload: { type: "object" },
                                    headers: { type: "object" }
                                }
                            }
                        }
                    }
                }
            }
        },
        "404": {
            description: "Message not found"
        },
        "500": {
            description: "Failed to get message details"
        }
    }
};