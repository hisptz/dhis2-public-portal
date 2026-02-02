import { Channel, ConsumeMessage } from 'amqplib'
import logger from '@/logging'
import { uploadMetadataFromQueue } from '@/services/metadata-migration/metadata-upload'
import { dbClient } from '@/clients/prisma'
import { ProcessStatus } from '@/generated/prisma/enums'
import { AxiosError } from 'axios'
import { logWorker } from '@/rabbit/utils'

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
    const metadataUploadTaskUid = message.content.toString()
    try {
        logger.info(
            `Processing metadata upload for task: ${metadataUploadTaskUid}`
        )
        const metaUploadTask = await dbClient.metadataUpload.findUnique({
            where: { uid: metadataUploadTaskUid },
            include: {
                run: true,
            },
        })
        if (!metaUploadTask) {
            logger.error(
                `Metadata upload task not found: ${metadataUploadTaskUid}`
            )
            channel.nack(message, false, false)
            return
        }
        await dbClient.metadataUpload.update({
            where: {
                uid: metadataUploadTaskUid,
            },
            data: { status: ProcessStatus.INIT, startedAt: new Date() },
        })
        await uploadMetadataFromQueue({ task: metaUploadTask })
        channel.ack(message)
    } catch (error) {
        if (error instanceof AxiosError) {
            logWorker(
                'error',
                `Failed to upload data for config ${metadataUploadTaskUid}: ${error.message}`
            )
            if ([400, 409, 404].includes(error.response?.status ?? 400)) {
                await dbClient.metadataUpload.update({
                    where: {
                        uid: metadataUploadTaskUid,
                    },
                    data: {
                        status: ProcessStatus.FAILED,
                        error: error.message,
                        errorObject: error.response?.data,
                    },
                })
            }
            channel.nack(message, false, false)
        } else if (error instanceof Error) {
            logWorker(
                'error',
                `Failed to upload data for config ${metadataUploadTaskUid}: ${error.message}`
            )
            await dbClient.metadataUpload.update({
                where: {
                    uid: metadataUploadTaskUid,
                },
                data: {
                    status: ProcessStatus.FAILED,
                    error: error.message,
                    finishedAt: new Date(),
                },
            })
            channel.nack(message, false, false)
        } else {
            logWorker(
                'error',
                `Failed to upload data for config ${metadataUploadTaskUid}: Unknown error ${error}`
            )
            await dbClient.metadataUpload.update({
                where: {
                    uid: metadataUploadTaskUid,
                },
                data: {
                    status: ProcessStatus.FAILED,
                    finishedAt: new Date(),
                },
            })
            channel.nack(message, false, false)
        }
    }
}
