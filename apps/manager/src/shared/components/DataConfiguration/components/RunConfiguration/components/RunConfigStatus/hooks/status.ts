import { useDataEngine } from "@dhis2/app-runtime";
import {
	DataDownloadSummary,
	DataServiceRunStatus,
	DataUploadSummary,
} from "@packages/shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { last } from "lodash";
import { useMemo } from "react";

const statusQuery: any = {
	download: {
		resource: `routes/data-service/run/services/data-download`,
		id: ({ id }: { id: string }) => `${id}/summary`,
	},
	upload: {
		resource: `routes/data-service/run/services/data-upload`,
		id: ({ id }: { id: string }) => `${id}/summary`,
	},
};

export function useDataConfigRunStatus(id: string) {
	const engine = useDataEngine();

	async function fetchStatus() {
		const response = await engine.query(statusQuery, {
			variables: {
				id,
			},
		});
		return response as {
			download: { summaries: DataDownloadSummary[] };
			upload: { summaries: DataUploadSummary[] };
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

				const lastDownloadStatus = last(
					data.download.summaries,
				)?.status;
				const lastUploadStatus = last(data.upload.summaries)?.status;

				if (
					!(
						lastDownloadStatus == "DONE" &&
						lastUploadStatus == "DONE"
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

		const lastDownloadStatus = last(download.summaries)?.status;
		const lastUploadStatus = last(upload.summaries)?.status;

		if (!lastDownloadStatus || !lastUploadStatus) {
			return DataServiceRunStatus.NOT_STARTED;
		}

		if (lastDownloadStatus != "DONE" || lastUploadStatus != "DONE") {
			return DataServiceRunStatus.RUNNING;
		}

		if (lastDownloadStatus == "DONE" && lastUploadStatus == "DONE") {
			return DataServiceRunStatus.COMPLETED;
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
