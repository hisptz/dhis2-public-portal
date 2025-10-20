import logger from "@/logging"; 
import { getChannel } from "./connection";
import { getQueueNames, QueueType } from "../variables/queue-names";
 

// Legacy queue names for backward compatibility
export const downloadQueue = "download_";
export const uploadQueue = "upload_";


export async function pushToQueue(
    configId: string, 
    queueType: QueueType, 
    jobData: any, 
    error?: any
) {
    const currentChannel = getChannel();
    if (!currentChannel) {
        throw new Error("Channel not initialized");
    }
    
    const queueNames = getQueueNames(configId);
    
    // Get the specific queue name based on type
    const queueName = queueNames[queueType];
    
    // Create message with metadata
    const messageData = {
        ...jobData,
        configId,
        queueType,
        timestamp: new Date().toISOString(),
        ...(error && queueType === 'failed' && {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            }
        })
    };
    
    const messageBuffer = Buffer.from(JSON.stringify(messageData));

    await currentChannel.sendToQueue(queueName, messageBuffer, {
        persistent: true,
    });
    
    logger.info(`Message pushed to ${queueType} queue: ${queueName}`);
}
 

// Legacy functions for backward compatibility
export async function pushToDownloadQueue(jobData: any) {
	const downloadChannel = getChannel();
	if (!downloadChannel) {
		throw new Error("Channel not initialized");
	}
	const queueName = downloadQueue + jobData.mainConfigId;
	downloadChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(jobData)), {
		persistent: true,
	});
}

export async function pushToUploadQueue(jobData: any) {
	const uploadChannel = getChannel();
	if (!uploadChannel) {
		throw new Error("Channel not initialized");
	}
	const queueName = uploadQueue + jobData.mainConfigId;
	uploadChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(jobData)), {
		persistent: true,
	});
}

