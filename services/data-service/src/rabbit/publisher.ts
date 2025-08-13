import logger from "@/logging";
import amqp from "amqplib";

let channel: amqp.Channel;

export const downloadQueue= "download_";

export const uploadQueue = "upload_";

export async function connectRabbit(maxRetries = 10, delayMs = 5000) {
    const rabbitUri = process.env.RABBITMQ_URI || "amqp://admin:Dhis%402025@vmi2689920.contaboserver.net:5672";

    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const connection = await amqp.connect(rabbitUri);
            channel = await connection.createChannel();
            logger.info("Connected to RabbitMQ");

            
            connection.on("close", () => {
                logger.warn("RabbitMQ connection closed. Reconnecting...");
                connectRabbit(maxRetries, delayMs);
            });

            connection.on("error", (err) => {
                logger.error("RabbitMQ connection error:", err.message);
            });

            return channel;
        } catch (err) {
            attempt++;
            logger.error(
                `RabbitMQ connection failed (Attempt ${attempt}/${maxRetries}): ${err}`
            );

            if (attempt >= maxRetries) {
                logger.error("Max retries reached. Could not connect to RabbitMQ.");
                throw err;
            }

            logger.info(`🔄 Retrying in ${delayMs / 1000} seconds...`);
            await new Promise((res) => setTimeout(res, delayMs));
        }
    }
}



export function getChannel(): amqp.Channel {
	if (!channel) throw new Error("RabbitMQ channel not initialized");
	return channel;
}

export async function pushToDownloadQueue(jobData: any) {
	const downloadChannel = getChannel();
	if (!downloadChannel) {
		throw new Error("Channel not initialized");
	}
	const queueName = downloadQueue + jobData.mainConfigId;
	await downloadChannel.assertQueue(queueName, { durable: true });
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
	await uploadChannel.assertQueue(queueName, { durable: true });
	uploadChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(jobData)), {
		persistent: true,
	});
}