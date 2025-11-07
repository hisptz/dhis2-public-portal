import { DataServiceRunStatus } from "@packages/shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getConfigStatus } from "../../../../../../../services/dataServiceClient";

export interface QueueStatusResult {
	queue: string;
	messages: number;
	messages_ready: number;
	messages_unacknowledged: number;
	dlq_messages: number;
	status: DataServiceRunStatus;
	last_activity?: string;
	consumers?: number;
}

export interface ConfigStatusResponse {
	success: boolean;
	configId: string;
	queues: {
		metadataDownload?: QueueStatusResult;
		metadataUpload?: QueueStatusResult;
		dataDownload?: QueueStatusResult;
		dataUpload?: QueueStatusResult;
	};
	health: {
		healthy: boolean;
		totalQueues: number;
		activeQueues: number;
		failedQueues: number;
		issues: string[];
	};
	timestamp: string;
}


export function useDataConfigRunStatus(id: string) {
	async function fetchStatus(): Promise<ConfigStatusResponse> {
 		const response = await getConfigStatus(id);
		if (response.success) {
			return response as any as ConfigStatusResponse;
		} else {
			throw new Error(response.message || 'Failed to fetch status');
		}
	}

	const { isLoading, data, error, isError } = useQuery({
		queryKey: ["config-status", id],
		queryFn: fetchStatus,
		refetchInterval: 5000,
		refetchIntervalInBackground: true,
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	const status: DataServiceRunStatus | null = useMemo(() => {
		if (!data || !data.queues) {
			return null;
		}

		const { queues } = data;

 		const statuses = [
			queues.metadataDownload?.status,
			queues.metadataUpload?.status,
			queues.dataDownload?.status,
			queues.dataUpload?.status,
		].filter(Boolean);

		if (statuses.length === 0) {
			return DataServiceRunStatus.NOT_STARTED;
		}

		// Priority order: RUNNING > QUEUED > FAILED > COMPLETED > IDLE > UNKNOWN
 		if (statuses.some(s => s === DataServiceRunStatus.RUNNING)) {
			return DataServiceRunStatus.RUNNING;
		}
		if (statuses.some(s => s === DataServiceRunStatus.QUEUED)) {
			return DataServiceRunStatus.QUEUED;
		}
		if (statuses.some(s => s === DataServiceRunStatus.FAILED)) {
			return DataServiceRunStatus.FAILED;
		}
		if (statuses.some(s => s === DataServiceRunStatus.COMPLETED)) {
			return DataServiceRunStatus.COMPLETED;
		}
 		if (statuses.every(s => s === DataServiceRunStatus.IDLE)) {
			return DataServiceRunStatus.IDLE;
		}
		if (statuses.every(s => s === DataServiceRunStatus.NOT_STARTED)) {
			return DataServiceRunStatus.IDLE;
		}

		return DataServiceRunStatus.UNKNOWN;
	}, [data]);

	return {
		isLoading,
		status,
		data,
		isError,
		error,
	};
}
