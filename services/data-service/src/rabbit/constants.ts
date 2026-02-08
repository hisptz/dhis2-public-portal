import { Channel, ConsumeMessage } from 'amqplib'
import { dataDownloadHandler } from '@/rabbit/handlers/data-download'
import { dataUploadHandler } from '@/rabbit/handlers/data-upload'
import { metadataDownloadHandler } from '@/rabbit/handlers/metadata-download'
import { metadataUploadHandler } from '@/rabbit/handlers/metadata-upload'
import { dataChunkHandler } from '@/rabbit/handlers/data-chunk'
import { metadataProcessingHandler } from '@/rabbit/handlers/metadata-processing'

export const REFRESH_EXCHANGE = 'refresh'

export const PROCESS_NAME = 'Worker'

export enum ProcessName {
	API = "API Worker",
    METADATA_DOWNLOAD = "Metadata Download Worker",
    METADATA_UPLOAD = "Metadata Upload Worker",
	DATA_UPLOAD = "Data Upload Worker",
	DATA_DOWNLOAD = "Data Download Worker",
}


export enum Queues {
    METADATA_DOWNLOAD = 'metadata_download',
    METADATA_PROCESSING = 'metadata_processing',
    METADATA_UPLOAD = 'metadata_upload',
    DATA_DOWNLOAD = 'data_download',
    DATA_CHUNK = 'data_chunk',
    DATA_UPLOAD = 'data_upload',
}

export const RECONNECT_DELAY = 5000
export const MAX_RETRIES = 2
export const retryCounts = new Map<string, number>()

export type QueueHandler = ({
    message,
    channel,
}: {
    message: ConsumeMessage | null
    channel: Channel
}) => Promise<void>

// Handler map for different queue types
export const queueHandlers: Map<Queues, QueueHandler> = new Map<
    Queues,
    QueueHandler
>([
    [Queues.DATA_CHUNK, dataChunkHandler],
    [Queues.DATA_DOWNLOAD, dataDownloadHandler],
    [Queues.DATA_UPLOAD, dataUploadHandler],
    [Queues.METADATA_DOWNLOAD, metadataDownloadHandler],
    [Queues.METADATA_PROCESSING, metadataProcessingHandler],
    [Queues.METADATA_UPLOAD, metadataUploadHandler],
])
