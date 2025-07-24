import { dataDownloadQueues, dataUploadQueues } from "@/variables/queue";
import { get } from "lodash";
import { DataServiceRunStatus } from "@packages/shared/schemas";

export function getDownloadStatus(configId: string) {
	const downloadQueue = get(dataDownloadQueues, configId);
	if (!downloadQueue) {
		return {
			status: DataServiceRunStatus.NOT_STARTED,
		};
	}
	if (downloadQueue.idle()) {
		return {
			status: DataServiceRunStatus.IDLE,
		};
	}
	if (downloadQueue.running() > 0) {
		return {
			status: DataServiceRunStatus.RUNNING,
		};
	}

	return {
		status: DataServiceRunStatus.UNKNOWN,
	};
}

export function getUploadStatus(configId: string) {
	const uploadQueue = get(dataUploadQueues, configId);
	if (!uploadQueue) {
		return {
			status: DataServiceRunStatus.NOT_STARTED,
		};
	}
	if (uploadQueue.idle()) {
		return {
			status: DataServiceRunStatus.IDLE,
		};
	}
	if (uploadQueue.running() > 0) {
		return {
			status: DataServiceRunStatus.RUNNING,
		};
	}

	return {
		status: DataServiceRunStatus.UNKNOWN,
	};
}
