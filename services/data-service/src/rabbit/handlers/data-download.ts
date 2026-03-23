import logger from '@/logging'
import { downloadData } from '@/services/data-migration/data-download'
import { Channel, ConsumeMessage } from 'amqplib'
import { QueuedJobError } from '@/utils/error'
import { dbClient } from '@/clients/prisma'
import { NullableJsonNullValueInput } from '@/generated/prisma/internal/prismaNamespace'
import { updateDownloadStatus } from '@/services/data-migration/utils/db'
import { ProcessStatus } from '@/generated/prisma/enums'

export async function dataDownloadHandler({
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
    const dataDownloadTaskUid = message.content.toString()
    logger.info(`Processing data download for config: ${dataDownloadTaskUid}`)

    const dataDownloadTask = await dbClient.dataDownload.findUnique({
        where: { uid: dataDownloadTaskUid },
        include: {
            run: true,
        },
    })
    if (!dataDownloadTask) {
        logger.error(`Data download task not found: ${dataDownloadTaskUid}`)
        channel.nack(message, false, false)
        return
    }

    try {
        await updateDownloadStatus(dataDownloadTaskUid, {
            status: ProcessStatus.INIT,
            startedAt: new Date(),
        })
        await downloadData(dataDownloadTask)
        await updateDownloadStatus(dataDownloadTaskUid, {
            status: ProcessStatus.DONE,
            finishedAt: new Date(),
        })
        channel.ack(message)
    } catch (error) {
        if (error instanceof QueuedJobError) {
            logger.error(
                `Failed to upload data for config ${dataDownloadTaskUid}: ${error.message}`
            )
            console.log(error.errorObject)
            await updateDownloadStatus(dataDownloadTaskUid, {
                status: 'FAILED',
                error: error.message,
                finishedAt: new Date(),
                errorObject:
                    error.errorObject as unknown as NullableJsonNullValueInput,
            })
            channel.nack(message, undefined, error.requeue)
        } else if (error instanceof Error) {
            logger.error(
                `Failed to upload data for config ${dataDownloadTaskUid}: ${error.message}`
            )
            channel.nack(message, false, false)
        }
    }
}
