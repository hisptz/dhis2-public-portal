#!/usr/bin/env node

import { Channel } from 'amqplib'
import figlet from 'figlet'
import logger from '@/logging'
import { connectRabbit, getConnection } from './connection'
import { queueHandlers, RECONNECT_DELAY } from '@/rabbit/constants'
import standard from 'figlet/fonts/Standard'
import { logWorker } from '@/rabbit/utils'
import { checkOrCreateFolder } from '@/utils/files'

figlet.parseFont('Standard', standard)
let isConnecting = false

export const startWorker = async () => {
    console.log(
        figlet.textSync('DHIS2 Data Service Worker', {
            horizontalLayout: 'default',
            verticalLayout: 'default',
            whitespaceBreak: true,
        })
    )
    checkOrCreateFolder(`outputs/metadata`)
    checkOrCreateFolder(`outputs/data`)
    if (isConnecting) {
        logWorker('info', 'A connection attempt is already in progress.')
        return
    }
    isConnecting = true
    try {
        await connectRabbit()
        const connection = getConnection()

        if (!connection) {
            throw new Error('Failed to get RabbitMQ connection')
        }

        const channel = await connection.createChannel()

        isConnecting = false

        // Setup reconnection on connection close
        connection.on('close', () => {
            logWorker(
                'error',
                'RabbitMQ connection closed! Attempting to reconnect...'
            )
            setTimeout(startWorker, RECONNECT_DELAY)
        })
        await setupConsumers(channel)
    } catch (error) {
        if (error instanceof Error) {
            logWorker(
                'error',
                `Failed to connect during startup: ${error.message ?? 'Unknown error'}. Retrying...`
            )
        } else {
            logWorker(
                'error',
                `Failed to connect during startup: Unknown error. Retrying...`
            )
        }
        isConnecting = false
        setTimeout(startWorker, RECONNECT_DELAY)
    }
}
const setupConsumers = async (channel: Channel) => {
    try {
        logWorker('info', 'Setting up consumers...')
        const prefetchCount = parseInt(
            process.env.RABBITMQ_PREFETCH_COUNT || '20'
        )
        await channel.prefetch(prefetchCount)
        for (const [queue, handler] of queueHandlers.entries()) {
            try {
                logWorker('info', `Setting up consumer for ${queue}`)
                await channel.assertQueue(queue, {
                    durable: true,
                })
                await channel.consume(queue, async (message) => {
                    try {
                        await handler({
                            message,
                            channel,
                        })
                    } catch (_e) {
                        channel.nack(message!, false, true)
                    }
                })
                logWorker('info', `Consumer for ${queue} set up successfully`)
            } catch (error) {
                if (error instanceof Error) {
                    logWorker(
                        'error',
                        `Failed to set up consumer for ${queue}: ${error.message}`
                    )
                }
            }
        }
        // Set up queues and consumers for each config
        logWorker('info', 'All consumers set up successfully!')
        logger.info(
            '================================================================'
        )
        logWorker('info', `Prefetch count per channel: ${prefetchCount}`)
    } catch (error) {
        logger.error(
            '[ConsumerSetup] A critical error occurred during setup:',
            error
        )
        throw error
    }
}
await startWorker()
