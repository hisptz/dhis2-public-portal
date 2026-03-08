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
        const { imported, updated, deleted, ignored } = summary.importCount
        await updateUploadStatus(dataUploadTaskUid, {
            status: 'DONE',
            finishedAt: new Date(),
            count: imported + updated + deleted + ignored,
            imported: imported,
            ignored: ignored,
            updated: updated,
            deleted: deleted,
        })
        channel.ack(message)
    } catch (error) {
        if (error instanceof QueuedJobError) {
            logger.error(
                `Failed to upload data for config ${dataUploadTaskUid}: ${error.message}`
            )
            const { imported, updated, deleted, ignored } = (
                error.errorObject?.response as unknown as {
                    importCount: {
                        imported: number
                        updated: number
                        deleted: number
                        ignored: number
                    }
                }
            ).importCount
            await updateUploadStatus(dataUploadTaskUid, {
                status: 'FAILED',
                error: error.message,
                imported: imported,
                ignored: ignored,
                updated: updated,
                deleted: deleted,
                count: imported + ignored + updated + deleted,
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
