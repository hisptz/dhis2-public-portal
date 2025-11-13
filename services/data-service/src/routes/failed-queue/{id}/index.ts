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
        
        // RabbitMQ Management API configuration
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

        try {
            // First, get queue information
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

            // If we need to inspect messages and there are messages available
            if (totalFailedMessages > 0 && (includeMessages || onlyQueues)) {
                // For pagination, we need to fetch more messages than just limit + offset
                // because we might need to filter by queue, so we fetch a larger batch
                const fetchCount = onlyQueues ? 
                    Math.min(50, totalFailedMessages) : // For queue discovery, fetch reasonable amount
                    Math.min(offset + limit * 2, totalFailedMessages); // For pagination, fetch extra to handle filtering
                
                // Get messages using the Management API (truly non-destructive)
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

                // Process each message
                for (let i = 0; i < rawMessages.length; i++) {
                    const rawMsg = rawMessages[i];
                    const headers = rawMsg.properties?.headers || {};
                    
                    // Extract queue info from x-death header
                    const xDeath = headers['x-death'];
                    let sourceQueue = null;
                    
                    if (xDeath && Array.isArray(xDeath) && xDeath.length > 0) {
                        const deathInfo = xDeath[0];
                        sourceQueue = deathInfo.queue;
                    }
                    
                    
                    // Add to source queues set if we have a source queue
                    if (sourceQueue) {
                        sourceQueues.add(sourceQueue);
                    }
                    
                    // Only process full message details if includeMessages is true or onlyQueues is false
                    if (includeMessages || !onlyQueues) {
                        // Parse message content for full details
                        let payload;
                        try {
                            payload = JSON.parse(rawMsg.payload);
                        } catch {
                            payload = rawMsg.payload; // If not JSON, keep as string
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
                        
                        // Filter by source queue if specified
                        if (!filterByQueue || sourceQueue === filterByQueue) {
                            messages.push(messageDetails);
                        }
                    }
                    
                    // For onlyQueues mode, check if we've found all possible queues (early termination)
                    if (onlyQueues && sourceQueues.size >= 5) {
                        console.log(`Found all 5 possible source queues, stopping early at message ${i + 1}`);
                        break;
                    }
                }

                // Apply pagination to the filtered messages (only if not onlyQueues mode)
                if (!onlyQueues && messages.length > 0) {
                    const totalMessages = messages.length;
                    messages = messages.slice(offset, offset + limit);
                    
                    console.log(`Pagination applied: showing ${messages.length} messages (${offset + 1}-${offset + messages.length} of ${totalMessages} filtered)`);
                }
            }

        } catch (apiError: any) {
            console.warn(`RabbitMQ Management API error for config ${configId}:`, apiError.message);
            // Fallback to direct queue check if Management API fails
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

        // Build response based on query mode
        const responseData: any = {
            configId,
            totalFailedMessages,
            retrievedAt: new Date().toISOString()
        };
        
        if (onlyQueues) {
            responseData.sourceQueues = Array.from(sourceQueues);
            responseData.sourceQueueCount = sourceQueues.size;
        } else {
            responseData.messages = messages;
            if (sourceQueues.size > 0) {
                responseData.sourceQueues = Array.from(sourceQueues);
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

