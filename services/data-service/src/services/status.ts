import axios from "axios";
import { DataServiceRunStatus } from "@packages/shared/schemas";
import logger from "@/logging";
import { getQueueNames } from "@/variables/queue-names";
import { config } from "dotenv";



export interface QueueStatusResult {
	queue: string;
	messages: number;
	messages_ready: number;
	messages_unacknowledged: number;
	dlq_messages: number,
	status: DataServiceRunStatus;
}

const queueActivityMap: Map<string, { 
	hasActivity: boolean; 
	lastSeen: Date; 
	lastProcessedCount: number;
	wasProcessing: boolean;
}> = new Map();

export const getQueueStatus = async (queueName: string, configId: string): Promise<QueueStatusResult | null> => {
	const host = process.env.RABBITMQ_HOST;
	const username = process.env.RABBITMQ_USER;
	const password = process.env.RABBITMQ_PASS;
	const vhost = encodeURIComponent(process.env.RABBITMQ_VHOST || "/");

	if (!host || !username || !password) return null;

	const url = `${host}/api/queues/${vhost}/${queueName}`;

	const dlqName = getQueueNames(configId).failed;
	const dlqUrl = `${host}/api/queues/${vhost}/${dlqName}`;

	try {
		const { data } = await axios.get(url, {
			auth: { username, password },
		});

		let dlqMessages = 0;

		try {
			const { data: dlqData } = await axios.get(dlqUrl, {
				auth: { username, password },
			});
			dlqMessages = dlqData.messages || 0;
		} catch (dlqError: any) {
			logger.warn(`No DLQ found for queue "${queueName}"`);
		}


		const { messages, messages_ready, messages_unacknowledged } = data;

		let status: DataServiceRunStatus = DataServiceRunStatus.UNKNOWN;

		const now = new Date();
		const previousActivity = queueActivityMap.get(queueName);
		const hadActivityBefore = previousActivity?.hasActivity || false;
		const wasProcessing = previousActivity?.wasProcessing || false;
		const hasActivityNow = messages > 0 || messages_ready > 0 || messages_unacknowledged > 0;
		const isProcessingNow = messages_unacknowledged > 0;

		// Update activity tracking
		queueActivityMap.set(queueName, {
			hasActivity: hadActivityBefore || hasActivityNow,
			lastSeen: hasActivityNow ? now : (previousActivity?.lastSeen || now),
			lastProcessedCount: messages,
			wasProcessing: isProcessingNow
		});

		// Determine status based on current state and history
		if (isProcessingNow) {
			// Currently processing messages
			status = DataServiceRunStatus.RUNNING;
		} else if (messages_ready > 0) {
			// Has messages waiting to be processed
			status = DataServiceRunStatus.QUEUED;
		} else if (messages === 0 && messages_ready === 0 && messages_unacknowledged === 0) {
			// No messages in queue
			if (wasProcessing && hadActivityBefore) {
				// Was processing before, now empty - likely completed
				// Check if completion was recent (within last 30 seconds)
				const timeSinceLastActivity = now.getTime() - (previousActivity?.lastSeen?.getTime() || 0);
				const recentlyCompleted = timeSinceLastActivity < 30000; // 30 seconds
				
				status = recentlyCompleted ? DataServiceRunStatus.COMPLETED : DataServiceRunStatus.IDLE;
			} else if (hadActivityBefore) {
				// Had activity before but wasn't actively processing
				status = DataServiceRunStatus.IDLE;
			} else {
				// Never had activity
				status = DataServiceRunStatus.NOT_STARTED;
			}
		}

		return {
			queue: queueName,
			messages,
			messages_ready,
			messages_unacknowledged,
			dlq_messages: dlqMessages,
			status,
		};
	} catch (error: any) {
		logger.error(`Failed to fetch queue "${queueName}":`, error.message);
		return {
			queue: queueName,
			messages: 0,
			messages_ready: 0,
			messages_unacknowledged: 0,
			dlq_messages: 0,
			status: DataServiceRunStatus.FAILED,
		};
	}
};

/**
 * Get status for multiple queues
 */
export const getMultipleQueueStatus = async (queueNames: string[], configId: string): Promise<QueueStatusResult[]> => {
	const statusPromises = queueNames.map(queueName => getQueueStatus(queueName, configId));
	const results = await Promise.allSettled(statusPromises);
	
	return results
		.map((result, index) => {
			if (result.status === 'fulfilled' && result.value) {
				return result.value;
			}
			
			// Return failed status for rejected promises
			logger.warn(`Failed to get status for queue: ${queueNames[index]}`);
			return {
				queue: queueNames[index],
				messages: 0,
				messages_ready: 0,
				messages_unacknowledged: 0,
				dlq_messages: 0,
				status: DataServiceRunStatus.FAILED,
			};
		});
};

/**
 * Get overall system health based on queue statuses
 */
export const getSystemHealth = async (configIds: string[]): Promise<{
	healthy: boolean;
	totalQueues: number;
	activeQueues: number;
	failedQueues: number;
	issues: string[];
}> => {
	const allResults = await Promise.all(
		configIds.map(async (configId) => {
			const queueNames = getQueueNames(configId);
			const allQueueNames = [
				queueNames.metadataDownload,
				queueNames.metadataUpload,  
				queueNames.dataDownload,
				queueNames.dataUpload,
			];
			return await getMultipleQueueStatus(allQueueNames, configId);
		})
	);
	
	const statuses = allResults.flat();
	const failedQueues = statuses.filter(s => s.status === DataServiceRunStatus.FAILED);
	const activeQueues = statuses.filter(s => 
		s.status === DataServiceRunStatus.RUNNING || 
		s.status === DataServiceRunStatus.QUEUED
	);

	const issues: string[] = [];
	
	if (failedQueues.length > 0) {
		issues.push(`${failedQueues.length} queue(s) are not accessible`);
	}

	// Check for queues with messages stuck in DLQ
	const dlqIssues = statuses.filter(s => s.dlq_messages > 0);
	if (dlqIssues.length > 0) {
		issues.push(`${dlqIssues.length} queue(s) have messages in dead letter queue`);
	}

	return {
		healthy: failedQueues.length === 0 && issues.length === 0,
		totalQueues: statuses.length,
		activeQueues: activeQueues.length,
		failedQueues: failedQueues.length,
		issues,
	};
};

/**
 * Mark a queue as completed (used when jobs finish processing)
 */
export const markQueueAsCompleted = (queueName: string): void => {
	const now = new Date();
	const previousActivity = queueActivityMap.get(queueName);
	
	queueActivityMap.set(queueName, {
		hasActivity: true,
		lastSeen: now,
		lastProcessedCount: 0,
		wasProcessing: true // Mark as was processing so it shows COMPLETED
	});
	
	logger.info(`Queue ${queueName} marked as completed`);
};