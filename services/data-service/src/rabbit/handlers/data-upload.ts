import { Channel, ConsumeMessage } from 'amqplib'
import logger from '@/logging'
import { dataFromQueue } from '@/services/data-migration/data-upload'
import { QueuedJobError } from '@/utils/error'
import { dbClient } from '@/clients/prisma'
import { updateUploadStatus } from '@/services/data-migration/utils/db'
import { NullableJsonNullValueInput } from '@/generated/prisma/internal/prismaNamespace'

export async function dataUploadHandler({
    channel,
    message,
}: {
    message: ConsumeMessage | null
    channel: Channel
}) {
    if (!message) {
        logger.error('Message content is empty')
        return
    }
    const dataUploadTaskUid = message.content.toString()
    logger.info(`Processing data download for config: ${dataUploadTaskUid}`)

    const dataUploadTask = await dbClient.dataUpload.findUnique({
        where: { uid: dataUploadTaskUid },
        include: {
            run: true,
        },
    })
    if (!dataUploadTask) {
        logger.error(`Data download task not found: ${dataUploadTaskUid}`)
        channel.nack(message, false, false)
        return
    }
    try {
        await updateUploadStatus(dataUploadTaskUid, {
            status: 'INIT',
            startedAt: new Date(),
        })
       const summary = await dataFromQueue(dataUploadTask)
        await updateUploadStatus(dataUploadTaskUid, {
            status: 'DONE',
            finishedAt: new Date(),
            count: summary.importCount.imported,
            imported: summary.importCount.imported,
            ignored: summary.importCount.ignored,
            updated: summary.importCount.updated,
        })
        channel.ack(message)
    } catch (error) {
        if (error instanceof QueuedJobError) {
            logger.error(
                `Failed to upload data for config ${dataUploadTaskUid}: ${error.message}`
            )
            await updateUploadStatus(dataUploadTaskUid, {
                status: 'FAILED',
                error: error.message,
                finishedAt: new Date(),
                errorObject:
                    error.errorObject as unknown as NullableJsonNullValueInput,
            })
            channel.nack(message, false, error.requeue)
        } else if (error instanceof Error) {
            logger.error(
                `Failed to upload data for config ${dataUploadTaskUid}: ${error.message}`
            )
            channel.nack(message, false, false)
        }
    }
}
