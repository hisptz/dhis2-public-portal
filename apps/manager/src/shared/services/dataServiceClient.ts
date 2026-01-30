import { useDataEngine } from '@dhis2/app-runtime'
import { set } from 'lodash'
import {
    MetadataMigrationConfig,
    StatusPayload,
} from '@packages/shared/schemas'

type DataEngine = ReturnType<typeof useDataEngine>
// export interface ApiResponse<
//     DataType extends Record<symbol | number | string, unknown> = Record<
//         string,
//         unknown
//     >,
// > {
//     success: boolean
//     message: string
//     data?: DataType
//     filesDeleted?: number
//     totalSizeDeleted?: string
//     queues?: string[]
// }

type ServerVersion = {
    major?: number
    minor?: number
    patch?: number
}
function isVersion42OrHigher(serverVersion?: ServerVersion): boolean {
    if (!serverVersion) return false
    const minor = serverVersion.minor || 0
    const major = serverVersion.major || 0
    if (major >= 2 && minor >= 42) return true
    return major >= 3
}

export async function executeDataServiceRoute<
    ResponseDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
    RequestDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
>(
    engine: DataEngine,
    endpoint: string,
    data?: RequestDataType,
    method: 'create' | 'delete' = 'create'
): Promise<ResponseDataType> {
    try {
        const mutationConfig = {
            type: method,
            resource: `routes/data-service/run${endpoint}`,
        }
        if (method !== 'delete' && data !== undefined) {
            set(mutationConfig, 'data', data)
        }

        return (await engine.mutate(
            // @ts-expect-error delete mutation
            mutationConfig
        )) as unknown as ResponseDataType
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error(`API call failed: ${String(error)}`)
    }
}

// Helper function to query DHIS2 engine for data service routes
export async function queryDataServiceRoute<
    ResponseDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
>(engine: DataEngine, endpoint: string): Promise<ResponseDataType> {
    try {
        const result = (await engine.query({
            result: {
                resource: `routes/data-service/run${endpoint}`,
            },
        })) as unknown as { result: ResponseDataType }
        return result.result
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error(`Query failed: ${String(error)}`)
    }
}

export async function downloadMetadata({
    engine,
    configId,
    data,
}: {
    engine: DataEngine
    configId: string
    data: MetadataMigrationConfig
}): Promise<{
    message: string
    status: string
}> {
    return executeDataServiceRoute<{
        message: string
        status: string
    }>(engine, `/metadata-download/${configId}`, data, 'create')
}

export async function downloadData<
    ResponseDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
    RequestDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
>(
    engine: DataEngine,
    configId: string,
    data: RequestDataType,
    serverVersion?: ServerVersion
): Promise<ResponseDataType> {
    return executeDataServiceRoute<ResponseDataType>(
        engine,
        `/data-download/${configId}`,
        {
            dataItemsConfigIds: data.dataItemsConfigIds || [],
            runtimeConfig: data.runtimeConfig || {},
            isDelete: data.isDelete || false,
        },
        'create'
    )
}

export async function createQueues<
    ResponseDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
>(engine: DataEngine, configId: string): Promise<ResponseDataType> {
    return executeDataServiceRoute<ResponseDataType>(
        engine,
        `/queues/${configId}`
    )
}

export async function deleteQueues<
    ResponseDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
>(engine: DataEngine, configId: string): Promise<ResponseDataType> {
    return executeDataServiceRoute<ResponseDataType>(
        engine,
        `/queues/${configId}`,
        {},
        'delete'
    )
}

export async function getConfigStatus(
    engine: DataEngine,
    configId: string
): Promise<StatusPayload> {
    try {
        return await queryDataServiceRoute<StatusPayload>(
            engine,
            `/status/${configId}`
        )
    } catch (error) {
        console.error(`getConfigStatus error for ${configId}:`, error)
        throw error
    }
}

export async function getFailedQueue<
    ResponseDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
>(
    engine: DataEngine,
    configId: string,
    options: {
        limit?: number
        offset?: number
        includeMessages?: boolean
        queue?: string
        onlyQueues?: boolean
    } = {}
): Promise<ResponseDataType> {
    try {
        const {
            limit = 50,
            offset = 0,
            includeMessages = false,
            queue,
            onlyQueues = false,
        } = options
        const queryParams = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
        })

        if (includeMessages) {
            queryParams.set('includeMessages', 'true')
        }

        if (onlyQueues) {
            queryParams.set('onlyQueues', 'true')
        }

        if (queue) {
            queryParams.set('queue', queue)
        }

        return await queryDataServiceRoute<ResponseDataType>(
            engine,
            `/failed-queue/${configId}?${queryParams}`
        )
    } catch (error) {
        console.error(`getFailedQueue error for ${configId}:`, error)
        throw error
    }
}

export async function getFailedQueueSources(
    engine: DataEngine,
    configId: string
): Promise<Record<string, unknown>> {
    try {
        return await queryDataServiceRoute(
            engine,
            `/failed-queue/${configId}?onlyQueues=true`
        )
    } catch (error) {
        console.error(`getFailedQueueSources error for ${configId}:`, error)
        throw error
    }
}

export async function clearFailedQueue<
    ResponseDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
>(engine: DataEngine, configId: string): Promise<ResponseDataType> {
    return executeDataServiceRoute<ResponseDataType>(
        engine,
        `/failed-queue/${configId}`,
        undefined,
        'delete'
    )
}

export async function retryByProcessType<
    ResponseDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
>(
    engine: DataEngine,
    configId: string,
    processType:
        | 'data-upload'
        | 'metadata-upload'
        | 'data-download'
        | 'metadata-download'
        | 'data-delete',
    maxRetries?: number
): Promise<ResponseDataType> {
    const queryParams = new URLSearchParams({
        retryType: 'process-type',
        processType,
    })

    if (maxRetries) {
        queryParams.set('maxRetries', maxRetries.toString())
    }

    return queryDataServiceRoute<ResponseDataType>(
        engine,
        `/retry/${configId}?${queryParams.toString()}`
    )
}

export async function retrySingleMessage<
    ResponseDataType extends Record<symbol | number | string, unknown> = Record<
        string,
        unknown
    >,
>(
    engine: DataEngine,
    configId: string,
    messageId: string
): Promise<ResponseDataType> {
    return executeDataServiceRoute<ResponseDataType>(
        engine,
        `/retry/${configId}/message/${messageId}`,
        undefined
    )
}
