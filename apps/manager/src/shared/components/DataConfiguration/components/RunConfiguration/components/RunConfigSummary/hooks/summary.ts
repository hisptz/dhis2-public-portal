import { useDataEngine } from "@dhis2/app-runtime";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { QueueStatusResult } from "../../RunConfigStatus/hooks/status";

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


export function useRunConfigSummary(id: string) {
	const engine = useDataEngine();

	async function fetchSummary() {
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
			queryFn: fetchSummary,
			queryKey: ["status", id],
			refetchInterval: 10 * 1000,
		},
	);

	const summaries = useMemo(() => {
		if (!data) {
			return null;
		}
		const { download, upload } = data;

		return {
			download: download,
			upload: upload,
		};
	}, [data]);

	return {
		isLoading,
		summaries,
		refetch,
		isError,
		error,
		isRefetching,
	};
}
