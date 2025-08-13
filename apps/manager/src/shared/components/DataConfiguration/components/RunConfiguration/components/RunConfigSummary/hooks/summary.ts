import { useDataEngine } from "@dhis2/app-runtime";
import {
	DataDownloadSummary,
	DataUploadSummary,
} from "@packages/shared/schemas";
import { useQuery } from "@tanstack/react-query";
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

export function useRunConfigSummary(id: string) {
	const engine = useDataEngine();

	async function fetchSummary() {
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
			queryFn: fetchSummary,
			queryKey: ["summary", id],
			refetchInterval: 10 * 1000,
		},
	);

	const summaries = useMemo(() => {
		if (!data) {
			return null;
		}
		const { download, upload } = data;

		return {
			download: download.summaries,
			upload: upload.summaries,
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
