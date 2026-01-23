import { useQuery } from '@tanstack/react-query'
import { useDataEngine } from '@dhis2/app-runtime'
import {
    getConfigStatus,
    getFailedQueueSources,
} from '../../../../../../../services/dataServiceClient'

interface ProcessStatus {
    queued: number
    processing: number
    failed: number
}

interface ProcessMonitoringData {
    metadataDownload: ProcessStatus
    metadataUpload: ProcessStatus
    dataDownload: ProcessStatus
    dataUpload: ProcessStatus
    dataDeletion: ProcessStatus
}

function mapSourceQueueToProcessType(queueName: string): string {
    const normalizedQueue = queueName.toLowerCase()
    if (normalizedQueue.includes('metadata-download')) return 'metadataDownload'
    if (normalizedQueue.includes('metadata-upload')) return 'metadataUpload'
    if (normalizedQueue.includes('data-download')) return 'dataDownload'
    if (normalizedQueue.includes('data-upload')) return 'dataUpload'
    if (normalizedQueue.includes('data-deletion')) return 'dataDeletion'
    return 'unknown'
}

function countFailedMessagesBySourceQueues(
    sourceQueueCounts: Record<string, number>,
    totalFailedMessages: number = 0
): Record<string, number> {
    const counts = {
        metadataDownload: 0,
        metadataUpload: 0,
        dataDownload: 0,
        dataUpload: 0,
        dataDeletion: 0,
    }

    // First, count what we found
    Object.entries(sourceQueueCounts).forEach(([queueName, failedCount]) => {
        const processType = mapSourceQueueToProcessType(queueName)
        if (counts.hasOwnProperty(processType)) {
            counts[processType as keyof typeof counts] += failedCount
        }
    })

    // If we have a total count greater than what we sampled, scale up proportionally
    const totalInSample = Object.values(counts).reduce(
        (sum, count) => sum + count,
        0
    )
    if (totalFailedMessages > totalInSample && totalInSample > 0) {
        const scaleFactor = totalFailedMessages / totalInSample
        Object.keys(counts).forEach((key) => {
            counts[key as keyof typeof counts] = Math.round(
                counts[key as keyof typeof counts] * scaleFactor
            )
        })
    } else if (totalFailedMessages > 0 && totalInSample === 0) {
        // distribute evenly as fallback
        const perType = Math.floor(
            totalFailedMessages / Object.keys(counts).length
        )
        Object.keys(counts).forEach((key) => {
            counts[key as keyof typeof counts] = perType
        })
    }

    return counts
}

export function useProcessMonitoring(configId: string) {
    const engine = useDataEngine()

    return useQuery({
        queryKey: ['processStatus', configId],
        queryFn: async () => {
            const [statusResponse, failedQueueResponse] = await Promise.all([
                getConfigStatus(engine, configId),
                getFailedQueueSources(engine, configId).catch(() => ({
                    success: false,
                    message: 'Failed to fetch failed queue sources',
                    data: {
                        configId,
                        totalFailedMessages: 0,
                        sourceQueues: [],
                        sourceQueueCount: 0,
                        sourceQueueCounts: {},
                        retrievedAt: new Date().toISOString(),
                    },
                })),
            ])

            if (!statusResponse.success) {
                throw new Error(
                    statusResponse.message || 'Failed to fetch process status'
                )
            }

            const baseProcesses =
                statusResponse.processes as ProcessMonitoringData

            const failedQueueData = failedQueueResponse.data
            const totalFailedMessages =
                failedQueueData?.totalFailedMessages || 0
            const failedCounts = countFailedMessagesBySourceQueues(
                failedQueueData.sourceQueueCounts || {},
                totalFailedMessages
            )

            return {
                metadataDownload: {
                    ...baseProcesses.metadataDownload,
                    failed: failedCounts.metadataDownload,
                },
                metadataUpload: {
                    ...baseProcesses.metadataUpload,
                    failed: failedCounts.metadataUpload,
                },
                dataDownload: {
                    ...baseProcesses.dataDownload,
                    failed: failedCounts.dataDownload,
                },
                dataUpload: {
                    ...baseProcesses.dataUpload,
                    failed: failedCounts.dataUpload,
                },
                dataDeletion: {
                    ...baseProcesses.dataDeletion,
                    failed: failedCounts.dataDeletion,
                },
            } as ProcessMonitoringData
        },
        refetchInterval: 3000,
        refetchIntervalInBackground: false,
    })
}
