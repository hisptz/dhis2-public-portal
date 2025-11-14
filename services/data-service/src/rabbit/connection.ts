import logger from "@/logging";
import amqp from "amqplib";
 
let channel: amqp.Channel;

export async function connectRabbit(maxRetries = 10, delayMs = 5000) {
    const rabbitUri = process.env.RABBITMQ_URI  || "amqp://localhost";

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
