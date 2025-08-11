import logger from "@/logging";
import amqp from 'amqplib';
import { uploadQueue } from "./publisher";
import { updateSummaryFile } from "@/services/summary";
import { DataUploadSummary } from "@packages/shared/schemas";
import { uploadDataFromFile } from "@/services/data-upload";
import { scheduleReconnect } from "./download.worker";


const activeUploadWorkers = new Map();

export async function startUploadWorker(configId: string) {
    let channelClosed = false;
    if (activeUploadWorkers.has(configId)) {
        logger.info(`Upload worker for configId "${configId}" is already running.`);
        return activeUploadWorkers.get(configId);
    }

    const rabbitUri = process.env.RABBITMQ_URI || "amqp://admin:Dhis%402025@vmi2689920.contaboserver.net:5672";
    let conn;
    try {
        conn = await amqp.connect(rabbitUri);
    } catch (err: any) {
        logger.error(`Failed to connect to RabbitMQ for configId "${configId}": ${err.message || err}`);
        throw err;
    }

    conn.on("close", () => {
        logger.warn(`RabbitMQ connection closed for configId "${configId}".`);
        activeUploadWorkers.delete(configId);
        scheduleReconnect(configId);
    });

    conn.on("error", (err) => {
        logger.error(`RabbitMQ connection error for configId "${configId}": ${err.message}`);
    });

    const channel = await conn.createChannel();

    const queueName = uploadQueue + configId;
    await channel.assertQueue(queueName, { durable: true });

    channel.on("close", () => {
        channelClosed = true;
        logger.warn(`RabbitMQ channel closed for configId "${configId}". Reconnecting...`);
        activeUploadWorkers.delete(configId);
        scheduleReconnect(configId);
    });

    channel.on("error", (err) => {
        logger.error(`RabbitMQ channel error for configId "${configId}": ${err.message}`);
    });


    channel.prefetch(100);

    channel.consume(queueName, async (msg) => {
        if (msg === null) return;

        const job = JSON.parse(msg.content.toString());
        const { mainConfigId, filename } = job;

        logger.info(`Uploading data for config ${mainConfigId}`);

        try {
            logger.info(`Initializing upload queue for ${mainConfigId}`);
            const summary: DataUploadSummary = {
                type: "upload",
                status: "INIT",
                timestamp: new Date().toISOString(),
            };
            await uploadDataFromFile({ filename: filename, configId: mainConfigId });

            await updateSummaryFile({
                ...summary,
                configId: mainConfigId,
            });
            if (!channelClosed) channel.ack(msg);
        } catch (err) {
            logger.error(`Upload failed: ${err}`);
            if (!channelClosed) {
                try {
                    channel.nack(msg, false, true);
                } catch (ackErr: any) {
                    logger.error(`Failed to nack message for ${configId}: ${ackErr.message || ackErr}`);
                }
            }
        }
    });

    activeUploadWorkers.set(configId, { conn, channel });
}


