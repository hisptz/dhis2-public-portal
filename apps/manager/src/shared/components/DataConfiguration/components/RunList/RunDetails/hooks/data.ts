import { FetchError, useDataEngine } from "@dhis2/app-runtime";
import { useQuery } from "@tanstack/react-query";
import {
	DataDownloadJob,
	MetadataRun,
	DataRun,
	DataUploadJob,
	MetadataDownloadJob,
	MetadataUploadJob,
} from "@/shared/components/DataConfiguration/components/RunList/hooks/data";
import { DataServiceConfig } from "@packages/shared/schemas";
import { useWatch } from "react-hook-form";

const query = {
	run: {
		resource: "routes/data-service/run/",
		id: ({
			configId,
			runId,
			type,
		}: {
			configId: string
			runId: string
			type: "metadata" | "data"
		}) => `${configId}/${type}/${runId}`,
	},
}

type RunDetailsMap = {
	metadata: MetadataRun & {
		status: string
		uploads: MetadataUploadJob[]
		downloads: MetadataDownloadJob[]
	}
	data: DataRun & {
		status: string
		uploads: DataUploadJob[]
		downloads: DataDownloadJob[]
	}
}

export function useRunDetails<T extends "metadata" | "data">({
	runId,
	type,
}: {
	runId: string
	type: T
}) {
	const config = useWatch<DataServiceConfig>()
	const engine = useDataEngine()

	const enabled = Boolean(config?.id && runId)

	const fetchRunDetails = async (): Promise<RunDetailsMap[T]> => {
		const data = await engine.query(query, {
			variables: {
				configId: config.id,
				runId,
				type,
			},
		})

		return data.run as RunDetailsMap[T]
	}

	return useQuery<RunDetailsMap[T], FetchError>({
		queryKey: [config?.id, "runs", type, runId, "details"],
		enabled,
		queryFn: fetchRunDetails,
		refetchInterval: (query) => {
			const status = query?.status
			if (!status) return false
			if (status === "DONE" || status === "FAILED") return false
			return 1000
		},
	})
}
