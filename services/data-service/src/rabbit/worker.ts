#!/usr/bin/env node

import { Channel, ChannelModel } from 'amqplib'
import figlet from 'figlet'
import logger from '@/logging'
import { connectRabbit, getConnection } from './connection'
import { dataFromQueue } from '@/services/data-migration/data-upload'
import { uploadMetadataFromQueue } from '@/services/metadata-migration/metadata-upload'
import { downloadAndQueueMetadata } from '@/services/metadata-migration/metadata-download'
import { getQueueNames } from '@/variables/queue-names'
import { DatastoreNamespaces } from '@packages/shared/constants'
import { dhis2Client } from '@/clients/dhis2'
import axios from 'axios'
import { downloadData } from '@/services/data-migration/data-download'
import { REFRESH_EXCHANGE } from '@/rabbit/constants'
import standard from 'figlet/fonts/Standard'

figlet.parseFont('Standard', standard)

let isConnecting = false
const RECONNECT_DELAY = 5000
const MAX_RETRIES = 2
const retryCounts = new Map<string, number>()

// Handler map for different queue types
const handlerMap: Record<string, (messageContent: any) => Promise<void>> = {
    dataDownload: async (messageContent) => {
        const { mainConfigId } = messageContent
        logger.info(`Processing data download for config: ${mainConfigId}`)
        await downloadData(messageContent)
    },

    dataDeletion: async (messageContent) => {
        const { mainConfigId, filename } = messageContent
        logger.info(
            `Processing data deletion for config: ${mainConfigId}, file: ${filename}`
        )
        await dataFromQueue(messageContent)
    },

    dataUpload: async (messageContent) => {
        const { mainConfigId, filename } = messageContent
        logger.info(
            `Processing data upload for config: ${mainConfigId}, file: ${filename}`
        )
        await dataFromQueue(messageContent)
    },

    metadataDownload: async (messageContent) => {
        const { configId } = messageContent
        logger.info(`Processing metadata download for config: ${configId}`)
        await downloadAndQueueMetadata(messageContent)
    },

    metadataUpload: async (messageContent) => {
        const { configId } = messageContent
        logger.info(`Processing metadata upload for config: ${configId}`)
        await uploadMetadataFromQueue(messageContent)
    },
}

export const startWorker = async () => {
    console.log(
        figlet.textSync('DHIS2 Data Service Worker', {
            horizontalLayout: 'default',
            verticalLayout: 'default',
            whitespaceBreak: true,
        })
    )
    if (isConnecting) {
        logger.info('[Worker] A connection attempt is already in progress.')
        return
    }
    isConnecting = true
    try {
        await connectRabbit()
        const connection = getConnection()

        if (!connection) {
            throw new Error('Failed to get RabbitMQ connection')
        }

        const downloadChannel = await connection.createChannel()
        const uploadChannel = await connection.createChannel()

        isConnecting = false

        // Setup reconnection on connection close
        connection.on('close', () => {
            logger.error(
                '[Worker] RabbitMQ connection closed! Attempting to reconnect...'
            )
            setTimeout(startWorker, RECONNECT_DELAY)
        })
        logger.info('[Worker] Setting up consumers...')
        await setupConsumer(downloadChannel, uploadChannel)
        await setupRefreshConsumer(connection)
    } catch (error) {
        logger.error(
            '[Worker] Failed to connect during startup. Retrying...',
            error
        )
        isConnecting = false
        setTimeout(startWorker, RECONNECT_DELAY)
    }
}

const setupRefreshConsumer = async (connection: ChannelModel) => {
    logger.info('[RefreshConsumer] Starting setup...')
    const refreshChannel = await connection.createChannel()
    await refreshChannel.assertExchange(REFRESH_EXCHANGE, 'fanout', {
        durable: true,
    })
    const queue = await refreshChannel.assertQueue('')
    await refreshChannel.bindQueue(queue.queue, REFRESH_EXCHANGE, '')
    await refreshChannel.consume(queue.queue, async (msg) => {
        if (msg) {
            const messageContent = JSON.parse(msg.content.toString())
            logger.info(
                `[RefreshConsumer] Received refresh message for config: ${messageContent.configId}`
            )
            await setupConsumer(refreshChannel, refreshChannel)
        }
    })
    logger.info('[RefreshConsumer] Setup complete. Waiting for messages...')
}

const setupConsumer = async (
    downloadChannel: Channel,
    uploadChannel: Channel
) => {
    try {
        logger.info(
            '[ConsumerSetup] Starting to discover configs from datastore...'
        )
        const configIds = await getAllConfigIds()
        logger.info(`[ConsumerSetup] Found ${configIds.length} configurations`)

        const prefetchCount = parseInt(
            process.env.RABBITMQ_PREFETCH_COUNT || '20'
        )
        await downloadChannel.prefetch(prefetchCount)
        await uploadChannel.prefetch(prefetchCount)

        // Set up queues and consumers for each config
        for (const configId of configIds) {
            const queueNames = getQueueNames(configId)
            await downloadChannel.assertQueue(queueNames.failed, {
                durable: true,
            })
            await uploadChannel.assertQueue(queueNames.failed, {
                durable: true,
            })
            // Queue configuration with DLQ
            const queueOptions = {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': '',
                    'x-dead-letter-routing-key': queueNames.failed,
                },
            }

            // Setup work queues for this config
            const queuesToSetup = [
                {
                    queueName: queueNames.metadataDownload,
                    handlerType: 'metadataDownload',
                    channel: downloadChannel,
                },
                {
                    queueName: queueNames.metadataUpload,
                    handlerType: 'metadataUpload',
                    channel: uploadChannel,
                },
                {
                    queueName: queueNames.dataDownload,
                    handlerType: 'dataDownload',
                    channel: downloadChannel,
                },
                {
                    queueName: queueNames.dataUpload,
                    handlerType: 'dataUpload',
                    channel: uploadChannel,
                },
                {
                    queueName: queueNames.dataDeletion,
                    handlerType: 'dataDeletion',
                    channel: uploadChannel,
                },
            ]

            for (const { queueName, handlerType, channel } of queuesToSetup) {
                // Assert the queue
                await channel.assertQueue(queueName, queueOptions)

                // Start consuming from the queue
                await channel.consume(queueName, async (msg) => {
                    if (msg) {
                        const messageContent = JSON.parse(
                            msg.content.toString()
                        )
                        const jobId = `${messageContent.mainConfigId ?? messageContent.configId}-${messageContent.config?.id ?? messageContent.filename ?? 'metadata'}-${messageContent.periodId ?? handlerType}`
                        const currentRetries = retryCounts.get(jobId) || 0
                        const queueType = handlerType
                        try {
                            const handler = handlerMap[queueType]

                            if (!handler) {
                                logger.warn(
                                    `[Worker] No handler for queue type: ${queueType}. Discarding.`
                                )
                                channel.ack(msg)
                                retryCounts.delete(jobId)
                                return
                            }

                            await handler(messageContent)

                            channel.ack(msg)
                            retryCounts.delete(jobId)

                            logger.info(
                                `[Worker] <==> Message Processed & Acknowledged for ${queueType}.`
                            )
                        } catch (error: any) {
                            const rawRetryCount =
                                msg.properties.headers?.['x-retry-count']
                            let retryCount =
                                typeof rawRetryCount === 'number'
                                    ? rawRetryCount
                                    : parseInt(String(rawRetryCount || '0'), 10)
                            if (isNaN(retryCount)) retryCount = 0

                            if (!msg.properties.headers) {
                                msg.properties.headers = {}
                            }

                            // Enhanced failure reason - handle axios errors specially
                            const failureReason =
                                axios.isAxiosError(error) && error.response
                                    ? error.response.data
                                    : { message: error.message }

                            msg.properties.headers['x-failure-reason'] =
                                JSON.stringify(failureReason)
                            msg.properties.headers['x-error-message'] =
                                error.message
                            msg.properties.headers['x-error-name'] = error.name
                            msg.properties.headers['x-error-timestamp'] =
                                new Date().toISOString()
                            msg.properties.headers['x-queue-type'] = queueType

                            if (axios.isAxiosError(error)) {
                                msg.properties.headers['x-axios-status'] =
                                    error.response?.status?.toString() ||
                                    'unknown'
                                msg.properties.headers['x-axios-code'] =
                                    error.code || 'unknown'
                                msg.properties.headers['x-axios-url'] =
                                    error.config?.url || 'unknown'
                            }

                            try {
                                if (currentRetries < MAX_RETRIES) {
                                    retryCounts.set(jobId, currentRetries + 1)
                                    logger.warn(
                                        `Retrying job ${jobId}, attempt ${currentRetries + 1}`
                                    )
                                    channel.nack(msg, false, true)
                                } else {
                                    logger.error(
                                        `Job ${jobId} reached max retries, discarding`
                                    )
                                    retryCounts.delete(jobId)
                                    channel.nack(msg, false, false)
                                }
                            } catch (ackErr: any) {
                                logger.error(
                                    `Failed to nack message for ${configId}: ${ackErr.message || ackErr}`
                                )
                            }
                        }
                    }
                })

                logger.info(
                    `[ConsumerSetup] Setup consumer for queue: ${queueName} (${handlerType})`
                )
            }
        }

        logger.info(
            '================================================================'
        )
        logger.info(`[Worker] Setup complete. Waiting for messages...`)
        logger.info(`[Worker] Monitoring ${configIds.length} configurations`)
        logger.info(
            `[Worker] Registered handlers: ${Object.keys(handlerMap).join(', ')}`
        )
        logger.info(`[Worker] Prefetch count per channel: ${prefetchCount}`)
        logger.info(
            `[Worker] Download channel handles: dataDownload, metadataDownload`
        )
        logger.info(
            `[Worker] Upload channel handles: dataUpload, dataDeletion, metadataUpload`
        )
        logger.info(
            '================================================================'
        )
    } catch (error) {
        logger.error(
            '[ConsumerSetup] A critical error occurred during setup:',
            error
        )
        throw error
    }
}

// Helper function to get all config IDs from datastore
const getAllConfigIds = async (): Promise<string[]> => {
    try {
        const keysUrl = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`
        const response = await dhis2Client.get<string[]>(keysUrl)
        return response.data || []
    } catch (error) {
        logger.error('Failed to fetch config IDs from datastore:', error)
        return []
    }
}

await startWorker()
