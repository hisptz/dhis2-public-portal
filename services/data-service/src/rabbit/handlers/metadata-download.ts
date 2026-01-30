import logger from '@/logging'
import { downloadAndQueueMetadata } from '@/services/metadata-migration/metadata-download'
import { Channel, ConsumeMessage } from 'amqplib'
import { dbClient } from '@/clients/prisma'
import { ProcessStatus, RunStatus } from '@/generated/prisma/enums'
import { AxiosError } from 'axios'

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
    const metaDownloadTaskUid = message.content.toString()

    const metaDownloadTask = await dbClient.metadataDownload.findUnique({
        where: { uid: metaDownloadTaskUid },
        include: {
            run: true,
        },
    })

    if (!metaDownloadTask) {
        logger.error(`Metadata download task not found: ${metaDownloadTaskUid}`)
        channel.nack(message, false, false)
        return
    }

    await dbClient.metadataDownload.update({
        where: {
            uid: metaDownloadTaskUid,
        },
        data: {
            status: ProcessStatus.INIT,
        },
    })

    try {
        logger.info(
            `Processing metadata download for task: ${metaDownloadTaskUid}`
        )
        await downloadAndQueueMetadata({
            task: metaDownloadTask,
        })
        channel.ack(message)
    } catch (error) {
        if (error instanceof AxiosError) {
            if ([400, 409].includes(error.response?.status ?? 400)) {
                console.log(error.request)
                console.log(error.response)
                await dbClient.metadataDownload.update({
                    where: {
                        uid: metaDownloadTaskUid,
                    },
                    data: {
                        status: RunStatus.FAILED,
                        error: error.message,
                        errorObject: error.response?.data,
                    },
                })
            }
        } else if (error instanceof Error) {
            await dbClient.metadataDownload.update({
                where: {
                    uid: metaDownloadTaskUid,
                },
                data: { status: RunStatus.FAILED, error: error.message },
            })
            channel.nack(message, false, false)
            logger.error(
                `Failed to process metadata download for config ${metaDownloadTaskUid}: ${error.message}`
            )
        } else {
            await dbClient.metadataDownload.update({
                where: {
                    uid: metaDownloadTaskUid,
                },
                data: { status: RunStatus.FAILED, error: 'Unknown error' },
            })
            channel.nack(message, false, false)
            logger.error(
                `Failed to process metadata download for config ${metaDownloadTaskUid}: Unknown error ${error}`
            )
        }
    }
}
