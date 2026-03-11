import { FetchError, useDataEngine } from '@dhis2/app-runtime'
import { RunStatus } from '@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigStatus/RunConfigStatus'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
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

const query = {
    runs: {
        resource: 'routes/data-service/run/',
        id: ({ id, type }: { id: string; type: RunType }) => `${id}/${type}`,
        params: ({ page, pageSize }: { page: number; pageSize: number }) => ({
            page,
            pageSize,
        }),
    },
}

type RunType = 'metadata' | 'data'

export function useConfigurationRuns<T extends RunType>(type: T) {
    const config = useWatch<DataServiceConfig>()
    const engine = useDataEngine()

    const enabled = Boolean(config?.id)

    const [paginationState, setPaginationState] = useState<
        Record<RunType, { page: number; pageSize: number }>
    >({
        metadata: { page: 1, pageSize: 10 },
        data: { page: 1, pageSize: 10 },
    })

    useEffect(() => {
        setPaginationState((prev) => {
            if (prev[type].page === 1) return prev

            return {
                ...prev,
                [type]: {
                    ...prev[type],
                    page: 1,
                },
            }
        })
    }, [type])

    const page = paginationState[type].page
    const pageSize = paginationState[type].pageSize

    const queryResult = useQuery({
        queryKey: [config?.id, type, page, pageSize],
        enabled,
        queryFn: async (): Promise<QueryResponse<RunTypeMap[T]>> => {
            const res = await engine.query(query, {
                variables: {
                    id: config.id,
                    type,
                    page,
                    pageSize,
                },
            })

            return res.runs as QueryResponse<RunTypeMap[T]>
        },
    })

    const pager = queryResult.data?.pager

    const onPageChange = (page: number) => {
        setPaginationState((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                page,
            },
        }))
    }

    const onPageSizeChange = (size: number) => {
        setPaginationState((prev) => ({
            ...prev,
            [type]: {
                page: 1,
                pageSize: size,
            },
        }))
    }

    const pagination = {
        page: pager?.page ?? page,
        pageSize: pager?.pageSize ?? pageSize,
        total: pager?.total ?? 0,
        pageCount: pager?.pageCount ?? 1,
        onPageChange,
        onPageSizeChange,
    }

    const refetch = useCallback(() => {
        setPaginationState((prev) => {
            if (prev[type].page === 1) {
                queryResult.refetch()
                return prev
            }
            return {
                ...prev,
                [type]: {
                    ...prev[type],
                    page: 1,
                },
            }
        })
    }, [type, queryResult])

    return {
        runs: queryResult.data?.items ?? [],
        loading: queryResult.isLoading,
        fetching: queryResult.isFetching,
        error: queryResult.error as FetchError | null,
        pagination,
        refetch,
    }
}
