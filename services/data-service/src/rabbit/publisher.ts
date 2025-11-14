import logger from "@/logging";
import { getChannel } from "./connection";
import { getQueueNames, QueueType } from "../variables/queue-names";

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
    const queueName = queueNames[queueType];

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



