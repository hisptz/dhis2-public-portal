import logger from "@/logging";
import amqp from 'amqplib';
import { uploadQueue } from "./publisher";
import { updateSummaryFile } from "@/services/summary";
import { DataUploadSummary } from "@packages/shared/schemas";
import { uploadDataFromFile } from "@/services/data-upload";

export async function startUploadWorker() {
    const configId = 'hmis';
    const rabbitUri = process.env.RABBITMQ_URI || "amqp://admin:Dhis%402025@vmi2689920.contaboserver.net:5672";
    const conn = await amqp.connect(rabbitUri);
    const channel = await conn.createChannel();

    const queueName = uploadQueue + configId;
    await channel.assertQueue(queueName, { durable: true });

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
            channel.ack(msg);
        } catch (err) {
          logger.error(`Upload failed: ${err}`);
          channel.nack(msg, false, false);
        }
    });
}


