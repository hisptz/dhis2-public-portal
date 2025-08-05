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
import dotenv from "dotenv";
import { getDimensions } from '@/utils/dimensions';
import pLimit from 'p-limit';

dotenv.config();


export async function startDownloadWorker() {
    const configId = 'hmis';
    const rabbitUri = process.env.RABBITMQ_URI || "amqp://admin:Dhis%402025@vmi2689920.contaboserver.net:5672";
    const conn = await amqp.connect(rabbitUri);
    const channel = await conn.createChannel();
    const queueName = downloadQueue + configId;
    await channel.assertQueue(queueName, { durable: true });

    channel.prefetch(100);

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
            channel.ack(msg);
            return;
        }

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

            // ✅ Parallel requeue with p-limit
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

                channel.ack(msg);
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
                channel.ack(msg);
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

            channel.ack(msg);
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

            channel.nack(msg, false, false);
        }
    });
}
