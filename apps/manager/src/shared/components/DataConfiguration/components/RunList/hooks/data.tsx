import { FetchError, useDataEngine } from '@dhis2/app-runtime'
import { RunStatus } from '@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigStatus/RunConfigStatus'
import { useQueries } from '@tanstack/react-query'
import { useState } from 'react'
import {
    DataErrorObject,
    DataServiceConfig,
    ImportSummary,
    MetadataErrorObject,
} from '@packages/shared/schemas'
import { useWatch } from 'react-hook-form'

enum MetadataSourceType {
    SOURCE_INSTANCE,
    FLEXIPORTAL_CONFIG,
}

export enum ProcessStatus {
    QUEUED,
    INIT,
    FAILED,
    DONE,
}

enum MetadataDownloadType {
    VISUALIZATION,
    MAP,
    DASHBOARD,
}

export interface Run {
    uid: string
    status: RunStatus
    startedAt: string
    periods: Array<string>
    timeout?: number
    mainConfigId: string
    error?: string
}

export interface MetadataRun extends Run {
    sourceType: MetadataSourceType
    visualizations: string[]
    dashboards: string[]
    maps: string[]
}

export interface DataRun extends Run {
    periods: string[]
    parentOrgUnit?: string
    orgUnitLevel?: number
    configIds: string[]
    isDelete: boolean
}

export interface Job {
    uid: string
    startedAt?: string
    finishedAt?: string
    status: ProcessStatus
    error?: string
}

export interface MetadataDownloadJob extends Job {
    type: MetadataDownloadType
    items: string[]
    errorObject?: MetadataErrorObject
}

export interface MetadataUploadJob extends Job {
    filename: string
    summary?: ImportSummary
    errorObject?: MetadataErrorObject
}

export interface DataDownloadJob extends Job {
    dimensions: Record<string, unknown>
    filters?: Record<string, unknown>
    count?: number
    errorObject?: DataErrorObject
}

export interface DataUploadJob extends Job {
    ignored?: number
    imported?: number
    updated?: number
    deleted?: number
    count?: number
    errorObject?: DataErrorObject
}

export interface MetadataRunDetails extends MetadataRun {
    uploads: Array<MetadataUploadJob>
    downloads: Array<MetadataDownloadJob>
}

export interface DataRunDetails extends DataRun {
    uploads: Array<DataUploadJob>
    downloads: Array<DataDownloadJob>
}

const query = {
    metadataRuns: {
        resource: 'routes/data-service/run/',
        id: ({ id }: { id: string }) => `${id}/metadata`,
        params: ({ page, pageSize }: { page: number; pageSize: number }) => ({
            page,
            pageSize,
        }),
    },
    dataRuns: {
        resource: 'routes/data-service/run/',
        id: ({ id }: { id: string }) => `${id}/data`,
        params: ({ page, pageSize }: { page: number; pageSize: number }) => ({
            page,
            pageSize,
        }),
    },
}

type RunTypeMap = {
    metadata: MetadataRun
    data: DataRun
}

interface QueryResponse<T extends Run = Run> {
    pager: {
        page: number
        pageSize: number
        total: number
        pageCount: number
    }
    items: T[]
}

export function useConfigurationRuns() {
    const config = useWatch<DataServiceConfig>()
    const engine = useDataEngine()

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const enabled = Boolean(config?.id)

    const fetchRuns = async <T extends keyof RunTypeMap>(
        type: T
    ): Promise<QueryResponse<RunTypeMap[T]>> => {
        return engine
            .query(query, {
                variables: {
                    id: config.id,
                    page,
                    pageSize,
                },
            })
            .then((res) =>
                type === 'metadata'
                    ? (res.metadataRuns as QueryResponse<RunTypeMap[T]>)
                    : (res.dataRuns as QueryResponse<RunTypeMap[T]>)
            )
    }

    const results = useQueries({
        queries: [
            {
                queryKey: [config.id, 'metadataRuns', page, pageSize],
                queryFn: () => fetchRuns('metadata'),
                enabled,
            },
            {
                queryKey: [config.id, 'dataRuns', page, pageSize],
                queryFn: () => fetchRuns('data'),
                enabled,
            },
        ],
    })

    const [metadataQuery, dataQuery] = results

    const loading = results.some((q) => q.isLoading)
    const fetching = results.some((q) => q.isFetching)
    const error = (results.find((q) => q.error)?.error as FetchError) ?? null

    const pager = metadataQuery.data?.pager ?? dataQuery.data?.pager

    const onPageChange = (page: number) => {
        setPage(page)
    }

    const onPageSizeChange = (pageSize: number) => {
        setPageSize(pageSize)
        setPage(1)
    }

    const pagination = {
        page: pager?.page ?? 1,
        pageSize: pager?.pageSize ?? pageSize,
        total: pager?.total ?? 0,
        pageCount: pager?.pageCount ?? 1,
        onPageChange,
        onPageSizeChange,
    }

    return {
        metadataRuns: metadataQuery.data?.items ?? [],
        dataRuns: dataQuery.data?.items ?? [],
        loading,
        fetching,
        error,
        pagination,
        refetch: () => {
            metadataQuery.refetch()
            dataQuery.refetch()
        },
    }
}
