import logger from '@/logging'
import * as amqp from 'amqplib'

let channel: amqp.Channel
let workerPublishChannel: amqp.Channel | null = null
let connection: amqp.ChannelModel

export function getConnection(): amqp.ChannelModel {
    if (!connection) throw new Error('RabbitMQ connection not initialized')
    return connection
}

export async function createWorkerPublishChannel(): Promise<amqp.Channel> {
    if (!connection) throw new Error('RabbitMQ connection not initialized')
    workerPublishChannel = await connection.createChannel()
    logger.info('Created dedicated worker publish channel')
    if (!workerPublishChannel)
        throw new Error('Failed to create worker publish channel')
    return workerPublishChannel
}

export async function connectRabbit(delayMs = 10000) {
    const rabbitUri = process.env.RABBITMQ_URI || 'amqp://localhost'

    try {
        logger.info('Connecting to RabbitMQ...')
        connection = await amqp.connect(rabbitUri)
        channel = await connection.createChannel()
        logger.info('Connected to RabbitMQ!')

        connection.on('close', () => {
            logger.warn('RabbitMQ connection closed. Reconnecting...')
            connectRabbit(delayMs)
        })

        connection.on('error', (err) => {
            logger.error('RabbitMQ connection error:', err.message)
        })

        return channel
    } catch (_err) {
        logger.info(`🔄 Retrying in ${delayMs / 1000} seconds...`)
        await new Promise((res) => setTimeout(res, delayMs))
    }
}

export function getChannel(): amqp.Channel {
    if (!channel) throw new Error('RabbitMQ channel not initialized')
    return channel
}
