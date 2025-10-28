import { createDownloadClient, dhis2Client } from "@/clients/dhis2";
import logger from "@/logging";
import { DatastoreNamespaces } from "@packages/shared/constants";
import {
    DataServiceAttributeValuesDataItemsSource,
    DataServiceConfig,
    DataServiceRuntimeConfig,
    DataServiceDataSourceItemsConfig
} from "@packages/shared/schemas";
import { AxiosError } from "axios";
import { chunk, compact, head, isEmpty } from "lodash";
import { pushToQueue } from "@/rabbit/publisher";
import { getQueueNames } from "@/variables/queue-names";
import { checkOrCreateFolder } from "@/utils/files";
import { fetchPagedData, processAttributeComboData, processData, saveDataFile } from "@/utils/data";
import pLimit from "p-limit";
import { getDimensions } from "@/utils/dimensions";

export interface DataDownloadOptions {
    mainConfigId: string;
    dataItemsConfigIds: Array<string>;
    runtimeConfig: DataServiceRuntimeConfig;
}

export interface DataProcessingJob {
    mainConfigId: string;
    mainConfig: DataServiceConfig;
    periodId: string;
    config: DataServiceDataSourceItemsConfig;
    runtimeConfig: DataServiceRuntimeConfig;
    overrideDimensions?: any;
}

export async function downloadAndQueueData(options: DataDownloadOptions): Promise<void> {
    try {
        const { mainConfigId, dataItemsConfigIds, runtimeConfig } = options;
        logger.info(`Starting data download and queue process for config: ${mainConfigId}`);
        logger.info(`Processing ${dataItemsConfigIds.length} data item configurations`);

        const mainConfig = await fetchMainConfiguration(mainConfigId);
        const dataItemConfigs = compact(dataItemsConfigIds.map((id) => {
            return mainConfig.itemsConfig.find(({ id: configId }) => configId === id);
        }));
        checkOrCreateFolder(`outputs/${mainConfigId}`);
        await enqueueDataDownloadTasks(mainConfig, runtimeConfig, dataItemConfigs);
        logger.info(`Data download jobs successfully queued for config: ${mainConfigId}`);
    } catch (error) {
        logger.error(`Error during download and queue process for config ${options.mainConfigId}:`, error);
        throw error;
    }
}

async function fetchMainConfiguration(configId: string): Promise<DataServiceConfig> {
    try {
        logger.info(`Getting configuration from server for ${configId}...`);
        const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${configId}`;
        const response = await dhis2Client.get<DataServiceConfig>(url);
        logger.info(`Configuration retrieved from server for ${configId}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            logger.error(`Could not get configuration ${configId} from server:`, error.message);
            if (error.response?.data) {
                logger.error(JSON.stringify(error.response?.data));
            }
        }
        throw error;
    }
}

async function enqueueDataDownloadTasks(
    mainConfig: DataServiceConfig,
    runtimeConfig: DataServiceRuntimeConfig,
    dataItemConfigs: DataServiceDataSourceItemsConfig[]
): Promise<void> {
    const configId = mainConfig.id;
    const queueNames = getQueueNames(configId);

    logger.info(`Using data download queue: ${queueNames.dataDownload}`);

    const pushPromises: Promise<void>[] = [];

    for (const periodId of runtimeConfig.periods) {
        for (const config of dataItemConfigs) {
            const message: DataProcessingJob = {
                mainConfigId: configId,
                mainConfig,
                periodId,
                config,
                runtimeConfig,
            };

            pushPromises.push(
                pushToQueue(configId, 'dataDownload', message, {
                    queuedAt: new Date().toISOString()
                })
            );
        }
    }

    await Promise.all(pushPromises);
    logger.info(`Successfully queued ${pushPromises.length} data download jobs`);
}

export async function downloadData(jobData: any): Promise<void> {
    try {
        const { mainConfigId, mainConfig, periodId, config, runtimeConfig, overrideDimensions } = jobData;

        logger.info(`Processing data download job for config: ${mainConfigId}`, {
            periodId,
            configId: config?.id,
            hasOverrideDimensions: !!overrideDimensions,
            jobDataKeys: Object.keys(jobData || {}),
        });

        // Get fresh configuration for client creation
        const mainConfigForClient = await fetchMainConfiguration(mainConfigId);
        const client = createDownloadClient({ config: mainConfigForClient });
        logger.info(`Processing job for config: ${mainConfigForClient.id}, period: ${periodId}, config: ${config.id}`);
        const shouldPaginate = await handlePagination(jobData, client);
        if (shouldPaginate) {
            return;
        }
        // Process the actual data download
        await processDataDownload(jobData, client);

    } catch (error: any) {
        logger.error(`Error processing data download job:`, {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
            jobData: {
                mainConfigId: jobData?.mainConfigId,
                configId: jobData?.config?.id,
                periodId: jobData?.periodId,
                hasOverrideDimensions: !!jobData?.overrideDimensions,
                jobDataKeys: Object.keys(jobData || {}),
            }
        });
        throw error;
    }
}



async function handlePagination(jobData: any, client: any): Promise<boolean> {
    const { mainConfigId, mainConfig, periodId, config, runtimeConfig, overrideDimensions } = jobData;

    if (overrideDimensions) {
        return false;
    }

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

    if (baseDimensions[heavyDimension].length <= pageSize) {
        return false;
    }

    logger.info(`Pagination needed for ${heavyDimension} (${baseDimensions[heavyDimension].length} items > ${pageSize})`);

    const chunks = chunk(baseDimensions[heavyDimension], pageSize);
    const limit = pLimit(10);

    await Promise.all(chunks.map(part => limit(async () => {
        const paginatedDimensions = {
            ...baseDimensions,
            [heavyDimension]: part,
        };

        await pushToQueue(mainConfigId, 'dataDownload', {
            mainConfigId,
            mainConfig,
            periodId,
            config,
            runtimeConfig,
            overrideDimensions: paginatedDimensions,
        }, {
            queuedAt: new Date().toISOString(),
            paginatedFrom: heavyDimension
        });
    })));

    logger.info(`Successfully queued ${chunks.length} paginated download jobs`);
    return true;
}

async function processDataDownload(jobData: any, client: any): Promise<void> {
    const { mainConfigId, mainConfig, periodId, config, runtimeConfig, overrideDimensions } = jobData;

    const dimensions = overrideDimensions || getDimensions({
        runtimeConfig,
        mappingConfig: config,
        periodId,
    });

    logger.info(`Fetching data for dimensions: ${JSON.stringify(Object.keys(dimensions))}`);

    const data = await fetchPagedData({
        dimensions,
        filters: config.filters,
        client,
        timeout: runtimeConfig.timeout,
    });

    logger.info(`Data download completed`);

    if (isEmpty(data.dataValues)) {
        logger.info(`No data found for ${config.id}: ${JSON.stringify(dimensions.dx?.slice(0, 5) || 'no dx')}`);
        return;
    }

    logger.info(`Processing ${data.dataValues.length} data values for ${JSON.stringify(dimensions.dx?.slice(0, 5) || 'no dx')}`);

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

    logger.info(`${processedData.dataValues.length} data values processed`);

    if (!isEmpty(processedData.dataValues)) {
        const filename = await saveDataFile({
            data: processedData.dataValues,
            config: mainConfig,
            itemsConfig: config,
        });
        logger.info(`haha xxx Data saved: ${processedData.dataValues}`);
        
        logger.info(` xxx Data saved to file: ${filename}`);

        await pushToQueue(mainConfigId, 'dataUpload', {
            mainConfigId,
            filename,
        }, {
            queuedAt: new Date().toISOString(),
            downloadedFrom: config.id
        });

        logger.info(`Upload job queued for file: ${filename}`);
    }
}