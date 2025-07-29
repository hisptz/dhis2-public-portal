import { useDataEngine } from "@dhis2/app-runtime";
import {
	DataServiceRunStatus,
} from "@packages/shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const statusQuery: any = {
	download: {
		resource: `routes/data-service/run/services/data-download`,
		id: ({ id }: { id: string }) => `${id}/status`,
	},
	upload: {
		resource: `routes/data-service/run/services/data-upload`,
		id: ({ id }: { id: string }) => `${id}/status`,
	},
};

export interface QueueStatusResult {
	queue: string;
	messages: number;
	messages_ready: number;
	messages_unacknowledged: number;
	status: DataServiceRunStatus;
}


export function useDataConfigRunStatus(id: string) {
	const engine = useDataEngine();

	async function fetchStatus() {
		const response = await engine.query(statusQuery, {
			variables: {
				id,
			},
		});
		return response as unknown as {
			download: QueueStatusResult;
			upload: QueueStatusResult;
		};
	}

	
	const { isLoading, data, error, isError, refetch, isRefetching } = useQuery(
		{
			queryFn: fetchStatus,
			queryKey: ["status", id],
			refetchInterval: (query) => {
				const data = query.state.data;
				if (!data) {
					return 5000;
				}

				const lastDownloadStatus = data.download.status;
				const lastUploadStatus = data.upload.status;

				if (
					!(
						lastDownloadStatus == DataServiceRunStatus.COMPLETED &&
						lastUploadStatus == DataServiceRunStatus.COMPLETED
					)
				) {
					return 5000;
				}
			},
		},
	);

	const status: DataServiceRunStatus | null = useMemo(() => {
		if (!data) {
			return null;
		}
		const { download, upload } = data;

		const lastDownloadStatus = download.status;
		const lastUploadStatus = upload.status;

		if (!lastDownloadStatus || !lastUploadStatus) {
			return DataServiceRunStatus.NOT_STARTED;
		}

		if (lastDownloadStatus == DataServiceRunStatus.RUNNING || lastUploadStatus == DataServiceRunStatus.RUNNING) {
			return DataServiceRunStatus.RUNNING;
		}

		if (lastDownloadStatus == DataServiceRunStatus.QUEUED || lastUploadStatus == DataServiceRunStatus.QUEUED) {
			return DataServiceRunStatus.QUEUED;
		}

		if (lastDownloadStatus == DataServiceRunStatus.IDLE && lastUploadStatus == DataServiceRunStatus.IDLE) {
			return DataServiceRunStatus.IDLE;
		}

		return DataServiceRunStatus.UNKNOWN;
	}, [data]);

	return {
		isLoading,
		status,
		refetch,
		isError,
		error,
		isRefetching,
	};
}
