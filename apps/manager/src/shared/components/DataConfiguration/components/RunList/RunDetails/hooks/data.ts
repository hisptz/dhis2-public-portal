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
import { useState } from "react";

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
		params: ({
			downloadsPage,
			downloadsPageSize,
			uploadsPage,
			uploadsPageSize,
		}: {
			downloadsPage: number
			downloadsPageSize: number
			uploadsPage: number
			uploadsPageSize: number
		}) => ({
			downloadsPage,
			downloadsPageSize,
			uploadsPage,
			uploadsPageSize,
		}),
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

	const [downloadsPage, setDownloadsPage] = useState(1)
	const [downloadsPageSize, setDownloadsPageSize] = useState(5)

	const [uploadsPage, setUploadsPage] = useState(1)
	const [uploadsPageSize, setUploadsPageSize] = useState(5)

	const enabled = Boolean(config?.id && runId)

	const fetchRunDetails = async (): Promise<RunDetailsMap[T]> => {
		const data = await engine.query(query, {
			variables: {
				configId: config.id,
				runId,
				type,
				downloadsPage,
				downloadsPageSize,
				uploadsPage,
				uploadsPageSize,
			},
		})

		return data.run as RunDetailsMap[T]
	}

	const queryResult = useQuery<RunDetailsMap[T], FetchError>({
		queryKey: [
			config?.id,
			"runs",
			type,
			runId,
			"details",
			downloadsPage,
			downloadsPageSize,
			uploadsPage,
			uploadsPageSize,
		],
		enabled,
		queryFn: fetchRunDetails,
		refetchInterval: (query) => {
			const status = (query?.state?.data as any)?.status
			if (!status) return false
			if (status === "DONE" || status === "FAILED") return false
			return 1000
		},
	})

	const downloadsPager = (queryResult.data as any)?.downloadsPager
	const uploadsPager = (queryResult.data as any)?.uploadsPager

	const downloadsPagination = {
		page: downloadsPager?.page ?? downloadsPage,
		pageSize: downloadsPager?.pageSize ?? downloadsPageSize,
		total: downloadsPager?.total ?? 0,
		pageCount: downloadsPager?.pageCount ?? 1,
		onPageChange: (page: number) => setDownloadsPage(page),
		onPageSizeChange: (size: number) => {
			setDownloadsPageSize(size)
			setDownloadsPage(1)
		},
	}

	const uploadsPagination = {
		page: uploadsPager?.page ?? uploadsPage,
		pageSize: uploadsPager?.pageSize ?? uploadsPageSize,
		total: uploadsPager?.total ?? 0,
		pageCount: uploadsPager?.pageCount ?? 1,
		onPageChange: (page: number) => setUploadsPage(page),
		onPageSizeChange: (size: number) => {
			setUploadsPageSize(size)
			setUploadsPage(1)
		},
	}

	return {
		run: queryResult.data,
		downloads: queryResult.data?.downloads ?? [],
		uploads: queryResult.data?.uploads ?? [],
		loading: queryResult.isLoading,
		fetching: queryResult.isFetching,
		error: queryResult.error ?? null,
		downloadsPagination,
		uploadsPagination,
		refetch: queryResult.refetch,
	}
}