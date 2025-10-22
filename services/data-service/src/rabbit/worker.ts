import { Channel, ConsumeMessage } from "amqplib";
import figlet from "figlet";
import logger from "@/logging";
import { connectRabbit, getChannel } from "./connection";
import { uploadDataFromFile } from "@/services/data-upload";
import { uploadMetadataFromQueue } from "@/services/metadata-migration/metadata-upload";
import { initializeDataDownload } from "@/services/data-download";
import { downloadAndQueueMetadata } from "@/services/metadata-migration/metadata-download";
import { getQueueNames } from "@/variables/queue-names";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { dhis2Client } from "@/clients/dhis2";
import axios from "axios";

let isConnecting = false;
const RECONNECT_DELAY = 5000;
const MAX_RETRIES = 3;

// Handler map for different queue types
const handlerMap: Record<string, (messageContent: any) => Promise<void>> = {
  "dataDownload": async (messageContent) => {
    const { mainConfigId, dataItemsConfigIds, runtimeConfig } = messageContent;
    logger.info(`Processing data download for config: ${mainConfigId}`);
    
    await initializeDataDownload({
      mainConfigId,
      dataItemsConfigIds,
      runtimeConfig,
    });
  },
  
  "dataUpload": async (messageContent) => {
    const { mainConfigId, filename } = messageContent;
    logger.info(`Processing data upload for config: ${mainConfigId}, file: ${filename}`);
    
    await uploadDataFromFile({ 
      filename, 
      configId: mainConfigId 
    });
  },
  
  "metadataDownload": async (messageContent) => {
    const { configId } = messageContent;
    logger.info(`Processing metadata download for config: ${configId}`);
    
    await downloadAndQueueMetadata(configId);
  },
  
   "metadataUpload": async (messageContent) => {
    const { configId } = messageContent;
    logger.info(`Processing metadata upload for config: ${configId}`);
    await uploadMetadataFromQueue(messageContent);
  },
};

export const startWorker = async () => {
  console.log(
    figlet.textSync("DHIS2 Data Service Worker", {
      horizontalLayout: "default",
      verticalLayout: "default",
      whitespaceBreak: true,
    }),
  );
  
  if (isConnecting) {
    logger.info("[Worker] A connection attempt is already in progress.");
    return;
  }
  isConnecting = true;
  try {
    await connectRabbit();
    const channel = getChannel();
    
    if (!channel) {
      throw new Error("Failed to get RabbitMQ channel");
    }
    
    isConnecting = false;

    // Setup reconnection on connection close
    channel.connection.once("close", () => {
      logger.error(
        "[Worker] RabbitMQ connection closed! Attempting to reconnect...",
      );
      setTimeout(startWorker, RECONNECT_DELAY);
    });

    logger.info("[Worker] Setting up consumers...");
    await setupConsumer(channel);
    
  } catch (error) {
    logger.error(
      "[Worker] Failed to connect during startup. Retrying...",
      error,
    );
    isConnecting = false;
    setTimeout(startWorker, RECONNECT_DELAY);
  }
};

const handleMessage = async (
  channel: Channel, 
  msg: ConsumeMessage, 
  queueType: string
) => {
  const handler = handlerMap[queueType];

  if (!handler) {
    logger.warn(
      `[Worker] No handler for queue type: ${queueType}. Discarding.`,
    );
    channel.ack(msg);
    return;
  }

  try {
    const messageContent = JSON.parse(msg.content.toString());
    const currentRetryCount = parseInt(msg.properties.headers?.["x-retry-count"] || "0");
    const isRetry = currentRetryCount > 0;
    
    logger.info(
      `[Worker] ==> Message Received! Queue Type: ${queueType}${isRetry ? ` (Retry ${currentRetryCount})` : ''}`,
      {
        retryCount: currentRetryCount,
        messageId: msg.properties.messageId,
        timestamp: new Date().toISOString(),
      }
    );
    
    await handler(messageContent);
    
    channel.ack(msg);
    logger.info(
      `[Worker] <== Message Processed & Acknowledged for ${queueType}.`,
    );
  } catch (error: any) {
    // Get retry count from custom header or initialize
    let retryCount = parseInt(msg.properties.headers?.["x-retry-count"] || "0");
    
    // Enhanced error logging
    logger.error(
      `[Worker] Handler error for ${queueType}. Retry attempt: ${retryCount + 1}`,
      {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        queueType,
        messageContent: JSON.parse(msg.content.toString()),
        retryCount,
        messageHeaders: msg.properties.headers,
      }
    );

    // Add error details to message headers for debugging
    if (!msg.properties.headers) {
      msg.properties.headers = {};
    }
    
    // Enhanced failure reason - handle axios errors specially
    const failureReason = axios.isAxiosError(error) && error.response
      ? error.response.data
      : { message: error.message };
    
    msg.properties.headers['x-failure-reason'] = JSON.stringify(failureReason);
    msg.properties.headers['x-error-message'] = error.message;
    msg.properties.headers['x-error-stack'] = error.stack;
    msg.properties.headers['x-error-name'] = error.name;
    msg.properties.headers['x-error-timestamp'] = new Date().toISOString();
    msg.properties.headers['x-queue-type'] = queueType;
    
    // Add additional axios error details if available
    if (axios.isAxiosError(error)) {
      msg.properties.headers['x-axios-status'] = error.response?.status?.toString() || 'unknown';
      msg.properties.headers['x-axios-code'] = error.code || 'unknown';
      msg.properties.headers['x-axios-url'] = error.config?.url || 'unknown';
    }

    if (retryCount < MAX_RETRIES) {
      logger.warn(`[Worker] Retrying message (attempt ${retryCount + 1}/${MAX_RETRIES}). Requeuing...`);
      
      try {
        // Get configId from message content to construct proper queue name
        const messageContent = JSON.parse(msg.content.toString());
        const configId = messageContent.configId;
        
        if (!configId) {
          logger.error(`[Worker] No configId found in message content for retry. Cannot determine queue name.`);
          channel.nack(msg, false, false); // Send to DLQ
          return;
        }
        
        // Get the proper queue names for this config
        const queueNames = getQueueNames(configId);
        const actualQueueName = queueNames[queueType as keyof typeof queueNames];
        
        if (!actualQueueName) {
          logger.error(`[Worker] No queue name found for type: ${queueType} and config: ${configId}`);
          channel.nack(msg, false, false); // Send to DLQ
          return;
        }
        
        // Republish message with updated retry count
        const updatedHeaders = {
          ...msg.properties.headers,
          'x-retry-count': retryCount + 1,
          'x-retry-timestamp': new Date().toISOString(),
        };
        
        await channel.sendToQueue(actualQueueName, msg.content, {
          ...msg.properties,
          headers: updatedHeaders,
        });
        
        logger.info(`[Worker] Message republished with retry count: ${retryCount + 1} to queue: ${actualQueueName}`, {
          newRetryCount: retryCount + 1,
          queueType,
          actualQueueName,
          configId,
          messageId: msg.properties.messageId,
        });
        
        // Acknowledge the current message after successful republish
        channel.ack(msg);
      } catch (republishError) {
        logger.error(`[Worker] Failed to republish message:`, republishError);
        // If republish fails, don't ack - let it go to DLQ
        channel.nack(msg, false, false);
      }
    } else {
      logger.error(
        `[Worker] Max retries (${MAX_RETRIES}) reached. Sending message to DLQ.`,
        {
          errorDetails: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        }
      );
      
      // false = don't requeue, send to DLQ
      channel.nack(msg, false, false);
    }
  }
};

const setupConsumer = async (channel: Channel) => {
  try {
    logger.info("[ConsumerSetup] Starting to discover configs from datastore...");
    
    // Get all config IDs from datastore (we'll need to implement this)
    const configIds = await getAllConfigIds();
    logger.info(`[ConsumerSetup] Found ${configIds.length} configurations`);

    // Set up queues and consumers for each config
    for (const configId of configIds) {
      const queueNames = getQueueNames(configId);
      
      // Create DLQ first
      await channel.assertQueue(queueNames.failed, { durable: true });
      
      // Queue configuration with DLQ
      const queueOptions = {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': queueNames.failed
        }
      };
      
      // Setup work queues for this config
      const queuesToSetup = [
        { queueName: queueNames.metadataDownload, handlerType: "metadataDownload" },
        { queueName: queueNames.metadataUpload, handlerType: "metadataUpload" },
        { queueName: queueNames.dataDownload, handlerType: "dataDownload" },
        { queueName: queueNames.dataUpload, handlerType: "dataUpload" },
      ];

      for (const { queueName, handlerType } of queuesToSetup) {
        // Assert the queue
        await channel.assertQueue(queueName, queueOptions);
        
        // Start consuming from the queue
        await channel.consume(queueName, (msg) => {
          if (msg) {
            handleMessage(channel, msg, handlerType);
          }
        });
        
        logger.info(`[ConsumerSetup] Setup consumer for queue: ${queueName} (${handlerType})`);
      }
    }

    channel.prefetch(5); // Process up to 5 messages concurrently per queue

    logger.info("================================================================");
    logger.info(`[Worker] Setup complete. Waiting for messages...`);
    logger.info(`[Worker] Monitoring ${configIds.length} configurations`);
    logger.info(`[Worker] Registered handlers: ${Object.keys(handlerMap).join(', ')}`);
    logger.info("================================================================");
    
  } catch (error) {
    logger.error(
      "[ConsumerSetup] A critical error occurred during setup:",
      error,
    );
  }
};

// Helper function to get all config IDs from datastore
const getAllConfigIds = async (): Promise<string[]> => {
  try { 
    const keysUrl = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`;
    const response = await dhis2Client.get<string[]>(keysUrl);
    return response.data || [];
  } catch (error) {
    logger.error("Failed to fetch config IDs from datastore:", error);
    return [];
  }
};
 
 