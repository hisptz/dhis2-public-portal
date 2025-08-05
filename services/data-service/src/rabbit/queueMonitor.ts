import logger from "@/logging";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface QueueMonitorOptions {
  queueName: string;
  intervalMs?: number;
  logProgress?: boolean;
}

export const waitForQueueToDrain = async ({
  queueName,
  intervalMs = 5000,
  logProgress = true,
  maxStuckChecks = 20,
}: QueueMonitorOptions & { maxStuckChecks?: number }): Promise<void> => {
  const host = process.env.RABBITMQ_HOST;
  const username = process.env.RABBITMQ_USER;
  const password = process.env.RABBITMQ_PASS;
  const vhost = encodeURIComponent(process.env.RABBITMQ_VHOST || "/");

  if (!host || !username || !password) {
    throw new Error("RabbitMQ credentials or host not set");
  }

  const queueUrl = `${host}/api/queues/${vhost}/${queueName}`;
  const auth = { username, password };

  const log = (...args: any[]) => {
    if (logProgress) logger.info(args);
  };

  let stuckCounter = 0;
  let lastState = { ready: null, unacked: null };

  log(`Waiting for queue "${queueName}" to drain...`);

  while (true) {
    try {
      const { data } = await axios.get(queueUrl, { auth });
      const { messages, messages_ready, messages_unacknowledged } = data;

      log(
        `[${queueName}] Total: ${messages}, Ready: ${messages_ready}, Unacked: ${messages_unacknowledged}`,
      );

      if (messages === 0) {
        log(`Queue "${queueName}" has finished processing.`);
        break;
      }

      const sameAsLast =
        lastState.ready === messages_ready &&
        lastState.unacked === messages_unacknowledged;

      if (sameAsLast) {
        stuckCounter++;
        if (stuckCounter >= maxStuckChecks) {
          const reason = `Queue "${queueName}" appears stuck after ${maxStuckChecks} checks. Deleting queue...`;
          logger.warn(reason);

           // Delete the queue
          try {
            await axios.delete(queueUrl, { auth });
            logger.info(`Queue "${queueName}" deleted successfully.`);
          } catch (deleteError: any) {
            logger.error(
              `Failed to delete stuck queue "${queueName}": ${deleteError.message}`,
            );
          }
          break;
        }
      } else {
        stuckCounter = 0;
        lastState = {
          ready: messages_ready,
          unacked: messages_unacknowledged,
        };
      }
    } catch (error: any) {
      logger.error(`Error checking queue "${queueName}": ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
};
