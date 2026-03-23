import { Channel, ConsumeMessage } from 'amqplib'
import logger from '@/logging'
import { dbClient } from '@/clients/prisma'
import { processMetadataDownload } from '@/services/metadata-migration/metadata-processing'
import { RunStatus } from '@/generated/prisma/enums'

export async function metadataProcessingHandler({
    channel,
    message,
}: {
    channel: Channel
    message: ConsumeMessage | null
}) {
    if (!message) {
        logger.error('Message content is empty')
        return
    }
    const metadataRunUid = message.content.toString()
    logger.info(`Processing metadata download for config: ${metadataRunUid}`)

    const metadataRun = await dbClient.metadataRun.findUnique({
        where: {
            uid: metadataRunUid,
        },
    })

    if (!metadataRun) {
        logger.error(`Metadata run ${metadataRunUid} not found`)
        channel.nack(message, false, false)
        return
    }

    try {
        await dbClient.metadataRun.update({
            where: { uid: metadataRunUid },
            data: { startedAt: new Date(), status: RunStatus.PROCESSING },
        })
        await processMetadataDownload({ metadataRun })
        await dbClient.metadataRun.update({
            where: {
                uid: metadataRunUid,
            },
            data: { status: RunStatus.PROCESSED },
        })
        channel.ack(message)
    } catch (error) {
        if (error instanceof Error) {
            await dbClient.metadataRun.update({
                where: {
                    uid: metadataRunUid,
                },
                data: { status: RunStatus.FAILED, error: error.message },
            })
            channel.nack(message, false, false)
            logger.error(
                `Failed to process metadata download for config ${metadataRunUid}: ${error.message}`
            )
        } else {
            await dbClient.metadataRun.update({
                where: {
                    uid: metadataRunUid,
                },
                data: { status: RunStatus.FAILED, error: 'Unknown error' },
            })
            channel.nack(message, false, false)
            logger.error(
                `Failed to process metadata download for config ${metadataRunUid}: Unknown error ${error}`
            )
        }
    }
}
