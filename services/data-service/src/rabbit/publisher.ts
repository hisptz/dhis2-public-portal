import logger from '@/logging'
import { getChannel } from './connection'
import { Queues } from '@/rabbit/constants'

export function pushToQueue({
    queue,
    reference,
}: {
    queue: Queues
    reference: string
}) {
    const currentChannel = getChannel()
    if (!currentChannel) {
        throw new Error('Channel not initialized')
    }
    const successful = currentChannel.sendToQueue(
        queue,
        Buffer.from(reference),
        {
            persistent: true,
        }
    )
    if (!successful) {
        logger.error(`Failed to push ${reference} to queue ${queue}`)
    } else {
        logger.info(`Message pushed to ${queue}`)
    }
    return successful
}
