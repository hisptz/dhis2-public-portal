import axios from "axios";
import { DataServiceRunStatus } from "@packages/shared/schemas";
import logger from "@/logging";



export interface QueueStatusResult {
	queue: string;
	messages: number;
	messages_ready: number;
	messages_unacknowledged: number;
	status: DataServiceRunStatus;
}

const queueActivityMap: Map<string, boolean> = new Map();

export const getQueueStatus = async (queueName: string): Promise<QueueStatusResult | null> => {
	const host = process.env.RABBITMQ_HOST;
	const username = process.env.RABBITMQ_USER;
	const password = process.env.RABBITMQ_PASS;
	const vhost = encodeURIComponent(process.env.RABBITMQ_VHOST || "/");

	if (!host || !username || !password) return null;

	const url = `${host}/api/queues/${vhost}/${queueName}`;

	try {
		const { data } = await axios.get(url, {
			auth: { username, password },
		});

		const { messages, messages_ready, messages_unacknowledged } = data;

		let status: DataServiceRunStatus = DataServiceRunStatus.UNKNOWN;

		const hadActivityBefore = queueActivityMap.get(queueName) || false;
		const hasActivityNow = messages > 0 || messages_ready > 0 || messages_unacknowledged > 0;

		if (hasActivityNow) {
			queueActivityMap.set(queueName, true);
		}

		if (messages === 0 && messages_ready === 0 && messages_unacknowledged === 0) {
			status = hadActivityBefore
				? DataServiceRunStatus.IDLE
				: DataServiceRunStatus.IDLE; // Should be NOT_STARTED if no previous activity, but for now we treat it as IDLE
		} else if (messages_unacknowledged > 0) {
			status = DataServiceRunStatus.RUNNING;
		} else if (messages_ready > 0) {
			status = DataServiceRunStatus.QUEUED;
		}

		return {
			queue: queueName,
			messages,
			messages_ready,
			messages_unacknowledged,
			status,
		};
	} catch (error: any) {
		logger.error(`Failed to fetch queue "${queueName}":`, error.message);
		return {
			queue: queueName,
			messages: 0,
			messages_ready: 0,
			messages_unacknowledged: 0,
			status: DataServiceRunStatus.FAILED,
		};
	}
};





