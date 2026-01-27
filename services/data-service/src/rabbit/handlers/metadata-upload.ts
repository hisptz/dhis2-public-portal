import { z } from 'zod'
import { Channel, ConsumeMessage } from 'amqplib'
import logger from '@/logging'
import { uploadMetadataFromQueue } from '@/services/metadata-migration/metadata-upload'

const metadataUploadMessageSchema = z.object({
    configId: z.string(),
})

export type MetadataUploadMessage = z.infer<typeof metadataUploadMessageSchema>

export async function metadataUploadHandler({
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
    const { success, data, error } = metadataUploadMessageSchema.safeParse(
        JSON.parse(message.content.toString())
    )

    if (!success) {
        logger.error(`Failed to parse message content: ${error?.message}`)
        channel.nack(message, false)
        return
    }

    const { configId } = data
    logger.info(`Processing metadata upload for config: ${configId}`)
    await uploadMetadataFromQueue(data)
}
