import { z } from 'zod'
import logger from '@/logging'
import { downloadAndQueueMetadata } from '@/services/metadata-migration/metadata-download'
import { Channel, ConsumeMessage } from 'amqplib'

const metadataDownloadMessageSchema = z.object({
    configId: z.string(),
})

export type MetadataDownloadMessage = z.infer<
    typeof metadataDownloadMessageSchema
>

export async function metadataDownloadHandler({
    message,
    channel,
}: {
    message: ConsumeMessage | null
    channel: Channel
}) {
    if (!message) {
        logger.error('Message content is empty')
        return
    }
    const { success, data, error } = metadataDownloadMessageSchema.safeParse(
        JSON.parse(message.content.toString())
    )

    if (!success) {
        logger.error(`Failed to parse message content: ${error?.message}`)
        channel.nack(message, false)
        return
    }

    const { configId } = data
    logger.info(`Processing metadata download for config: ${configId}`)
    await downloadAndQueueMetadata(data)
}
