import { Channel, ConsumeMessage } from 'amqplib'
import { logWorker } from '@/rabbit/utils'
import { dbClient } from '@/clients/prisma'
import { handleError, QueuedJobError } from '@/utils/error'
import { enqueueDownloadTasks } from '@/services/data-migration/data-download'

async function chunkData(dataRunId: string) {
    const dataRun = await dbClient.dataRun.findUnique({
        where: {
            uid: dataRunId,
        },
    })
    if (!dataRun) {
        logWorker('error', `Data run ${dataRunId} not found`)
        throw new QueuedJobError(`Data run ${dataRunId} not found`, false)
    }
    await enqueueDownloadTasks(dataRun)
}

export async function dataChunkHandler({
    message,
    channel,
}: {
    message: ConsumeMessage | null
    channel: Channel
}) {
    if (!message) {
        logWorker('error', 'Message content is empty')
        return
    }
    const dataRunId = message.content.toString()
    logWorker('info', `Received chunk for config: ${dataRunId}`)
    try {
        await chunkData(dataRunId)
        channel.ack(message)
    } catch (error) {
        if (error instanceof Error) {
            handleError(error)
        } else {
            logWorker(
                'error',
                `Failed to process chunk for config ${dataRunId}: Unknown error ${error}`
            )
        }
    }
}
