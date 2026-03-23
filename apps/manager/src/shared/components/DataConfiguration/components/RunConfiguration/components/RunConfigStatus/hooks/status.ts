import { useDataEngine } from '@dhis2/app-runtime'
import {
    DataDownloadSummary,
    DataServiceRunStatus,
    DataUploadSummary,
} from '@packages/shared/schemas'
import { useQuery } from '@tanstack/react-query'
import { last } from 'lodash'
import { useMemo } from 'react'

const statusQuery = {
    download: {
        resource: `routes/data-service/run/services/data-download`,
        id: ({ id }: { id: string }) => `${id}/summary`,
    },
    upload: {
        resource: `routes/data-service/run/services/data-upload`,
        id: ({ id }: { id: string }) => `${id}/summary`,
    },
}

export function useDataConfigRunStatus(id: string) {
    const engine = useDataEngine()

    async function fetchStatus() {
        const response = await engine.query(statusQuery, {
            variables: {
                id,
            },
        })
        return response as {
            download: { summaries: DataDownloadSummary[] }
            upload: { summaries: DataUploadSummary[] }
        }
    }

    const { isLoading, data, error, isError, refetch, isRefetching } = useQuery(
        {
            queryKey: ['status', id],
            queryFn: fetchStatus,
            refetchInterval: (query) => {
                const queryData = query?.state.data
                if (!queryData) {
                    return 5000
                }
                const lastDownloadStatus = last(
                    queryData.download.summaries
                )?.status
                const lastUploadStatus = last(
                    queryData.upload.summaries
                )?.status

                if (
                    lastDownloadStatus === 'DONE' &&
                    lastUploadStatus === 'DONE'
                ) {
                    return false
                }

                return 5000
            },
        }
    )

    const status: DataServiceRunStatus | null = useMemo(() => {
        if (!data) {
            return null
        }
        const { download, upload } = data

        const lastDownloadStatus = last(download.summaries)?.status
        const lastUploadStatus = last(upload.summaries)?.status

        if (!lastDownloadStatus || !lastUploadStatus) {
            return DataServiceRunStatus.NOT_STARTED
        }

        if (lastDownloadStatus != 'DONE' || lastUploadStatus != 'DONE') {
            return DataServiceRunStatus.RUNNING
        }

        if (lastDownloadStatus == 'DONE' && lastUploadStatus == 'DONE') {
            return DataServiceRunStatus.COMPLETED
        }

        return DataServiceRunStatus.UNKNOWN
    }, [data])

    return {
        isLoading,
        status,
        refetch,
        isError,
        error,
        isRefetching,
    }
}
