import amqp from 'amqplib';
import { createDownloadClient, dhis2Client } from '@/clients/dhis2';
import logger from '@/logging';
import { v4 } from 'uuid';
import { fetchPagedData, processAttributeComboData, processData, saveDataFile } from '@/utils/data';
import { updateSummaryFile } from '@/services/summary';
import { downloadQueue, pushToDownloadQueue, pushToUploadQueue } from './publisher';
import { DatastoreNamespaces } from '@packages/shared/constants';
import { DataDownloadSummary, DataServiceAttributeValuesDataItemsSource, DataServiceConfig } from '@packages/shared/schemas';
import { chunk, head, isEmpty } from 'lodash';
import { AxiosError } from 'axios';
import { config } from "dotenv";
import { getDimensions } from '@/utils/dimensions';
import pLimit from 'p-limit';

config();

const activeDownloadWorkers = new Map();
const retryCounts = new Map<string, number>();

export function scheduleReconnect(configId: string, attempt = 1) {
    const delay = Math.min(30000, attempt * 5000);
    logger.warn(`Retrying RabbitMQ connection for configId "${configId}" in ${delay / 1000}s...`);
    setTimeout(() => {
        startDownloadWorker(configId).catch(() => {
            scheduleReconnect(configId, attempt + 1);
        });
    }, delay);
}

export async function startDownloadWorker(configId: string) {
    let channelClosed = false;
    if (activeDownloadWorkers.has(configId)) {
        logger.info(`Download worker for configId "${configId}" is already running.`);
        return activeDownloadWorkers.get(configId);
    }

    const rabbitUri = process.env.RABBITMQ_URI || "amqp://admin:Dhis%402025@vmi2689920.contaboserver.net:5672";
    let conn;
    try {
        conn = await amqp.connect(rabbitUri);
    } catch (err: any) {
        logger.error(`Failed to connect to RabbitMQ for configId "${configId}": ${err.message || err}`);
        throw err;
    }

    conn.on("close", () => {
        logger.warn(`RabbitMQ connection closed for configId "${configId}".`);
        activeDownloadWorkers.delete(configId);
        scheduleReconnect(configId);
    });

    conn.on("error", (err) => {
        logger.error(`RabbitMQ connection error for configId "${configId}": ${err.message}`);
    });

    const channel = await conn.createChannel();
    const queueName = downloadQueue + configId;

    const dlqName = `dlq_${queueName}`;

    await channel.assertQueue(dlqName, { durable: true });

    await channel.assertQueue(queueName, {
        durable: true, arguments: {
            "x-dead-letter-exchange": "",
            "x-dead-letter-routing-key": dlqName,
        }
    });

    channel.on("close", () => {
        channelClosed = true;
        logger.warn(`RabbitMQ channel closed for configId "${configId}". Reconnecting...`);
        activeDownloadWorkers.delete(configId);
        scheduleReconnect(configId);
    });

    channel.on("error", (err) => {
        logger.error(`RabbitMQ channel error for configId "${configId}": ${err.message}`);
    });

    const prefetchCount = parseInt(process.env.RABBITMQ_PREFETCH_COUNT || "20");

    channel.prefetch(prefetchCount);

    channel.consume(queueName, async (msg) => {
        if (msg === null) return;

        const job = JSON.parse(msg.content.toString());
        const {
            mainConfigId,
            mainConfig,
            periodId,
            config,
            runtimeConfig
        } = job;

        if (!mainConfigId || !periodId || !config || !runtimeConfig) {
            logger.warn("Invalid job received", job);
            if (!channelClosed) channel.ack(msg);
            return;
        }

        const jobId = `${mainConfigId}-${config.id}-${periodId}`;
        const currentRetries = retryCounts.get(jobId) || 0;

        try {
            const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${mainConfigId}`;
            const response = await dhis2Client.get<DataServiceConfig>(url);
            const mainConfigForClient = response.data;
            const client = createDownloadClient({ config: mainConfigForClient });
            logger.info(`Processing job for config: ${mainConfigForClient.id}, period: ${periodId}, config: ${config.id}`);

            const baseDimensions: any = getDimensions({
                runtimeConfig,
                mappingConfig: config,
                periodId,
            });

            const heavyDimension = runtimeConfig.paginateByData
                ? "dx"
                : Object.keys(baseDimensions).reduce((acc, key) =>
                    (baseDimensions[acc]?.length || 0) > (baseDimensions[key]?.length || 0)
                        ? acc
                        : key
                );

            const pageSize = runtimeConfig.pageSize ?? 50;

            // Parallel requeue with p-limit
            if (!job.overrideDimensions && baseDimensions[heavyDimension].length > pageSize) {
                const chunks = chunk(baseDimensions[heavyDimension], pageSize);

                const limit = pLimit(10);

                await Promise.all(chunks.map(part => limit(async () => {
                    const paginatedDimensions = {
                        ...baseDimensions,
                        [heavyDimension]: part,
                    };
                    await pushToDownloadQueue({
                        mainConfigId,
                        mainConfig,
                        periodId,
                        config,
                        runtimeConfig,
                        overrideDimensions: paginatedDimensions,
                    });
                })));

                if (!channelClosed) channel.ack(msg);
                return;
            }

            const dimensions = job.overrideDimensions || baseDimensions;

            const data = await fetchPagedData({
                dimensions,
                filters: config.filters,
                client,
                timeout: runtimeConfig.timeout,
            });

            logger.info(`Data downloaded`);

            if (isEmpty(data.dataValues)) {
                logger.info(`No data found for ${config.id}: ${dimensions.dx}`);
                const summary: DataDownloadSummary = {
                    type: "download",
                    id: v4(),
                    status: "SUCCESS",
                    error: "No data found",
                    dataItems: dimensions.dx!,
                    periods: dimensions.pe!,
                    count: data.dataValues.length,
                    timestamp: new Date().toISOString(),
                };
                await updateSummaryFile({
                    ...summary,
                    configId: mainConfig.id,
                });
                if (!channelClosed) {
                    channel.ack(msg);
                    retryCounts.delete(jobId);
                }

                return;
            }

            logger.info(`Processing data for ${dimensions.dx}`);

            const processedData = config.type === "ATTRIBUTE_VALUES"
                ? await processAttributeComboData({
                    data,
                    dataItemsConfig: config,
                    categoryOptionId: head(
                        config.filters![(config as DataServiceAttributeValuesDataItemsSource).attributeId]
                    ) as string,
                })
                : await processData({
                    data,
                    dataItems: config.dataItems,
                });

            logger.info(`${processedData.dataValues.length} data values processed for ${JSON.stringify(dimensions)}`);

            if (!isEmpty(processedData.dataValues)) {
                const filename = await saveDataFile({
                    data: processedData.dataValues,
                    config: mainConfig,
                    itemsConfig: config,
                });
                logger.info(`Data saved for ${config.id}: ${dimensions.dx}`);

                const summary: DataDownloadSummary = {
                    type: "download",
                    id: v4(),
                    status: "SUCCESS",
                    dataItems: dimensions.dx!,
                    periods: dimensions.pe!,
                    count: data.dataValues.length,
                    timestamp: new Date().toISOString(),
                };
                await updateSummaryFile({
                    ...summary,
                    configId: mainConfig.id,
                });

                const uploadJob = {
                    mainConfigId,
                    filename,
                };
                pushToUploadQueue(uploadJob);
                logger.info(`Upload job pushed to queue for config: ${config.id}`);
            }
            if (!channelClosed) channel.ack(msg);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            const errorDetails = e instanceof AxiosError ? e.response?.data : undefined;

            logger.error(`Job failed: ${errorMessage}`);

            await updateSummaryFile({
                id: v4(),
                type: 'download',
                status: 'FAILED',
                configId: mainConfigId,
                error: errorMessage,
                errorDetails,
                timestamp: new Date().toISOString(),
            });

            if (!channelClosed) {
                try {
                    if (currentRetries < 2) {
                        retryCounts.set(jobId, currentRetries + 1);
                        logger.warn(`Retrying job ${jobId}, attempt ${currentRetries + 1}`);
                        channel.nack(msg, false, true);
                    } else {
                        logger.error(`Job ${jobId} reached max retries, discarding`);
                        retryCounts.delete(jobId);
                        channel.nack(msg, false, false);
                    }
                } catch (ackErr: any) {
                    logger.error(`Failed to nack message for ${configId}: ${ackErr.message || ackErr}`);
                }
            }
        }
    });
    activeDownloadWorkers.set(configId, { conn, channel });
}
