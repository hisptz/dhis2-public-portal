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
import { fetchPagedData, processAttributeComboData, processData } from "@/utils/data";
import pLimit from "p-limit";
import { getDimensions } from "@/utils/dimensions";

export interface DataDeleteOptions {
    mainConfigId: string;
    dataItemsConfigIds: Array<string>;
    runtimeConfig: DataServiceRuntimeConfig;
}

export interface DataDeleteJob {
    mainConfigId: string;
    mainConfig: DataServiceConfig;
    periodId: string;
    config: DataServiceDataSourceItemsConfig;
    runtimeConfig: DataServiceRuntimeConfig;
    overrideDimensions?: any;
}

export async function deleteAndQueueData(options: DataDeleteOptions): Promise<void> {
    try {
        const { mainConfigId, dataItemsConfigIds, runtimeConfig } = options;
        logger.info(`Starting data delete and queue process for config: ${mainConfigId}`);

        const mainConfig = await fetchMainConfiguration(mainConfigId);
        const dataItemConfigs = compact(dataItemsConfigIds.map((id) => {
            return mainConfig.itemsConfig.find(({ id: configId }) => configId === id);
        }));
        await enqueueDataDeleteTasks(mainConfig, runtimeConfig, dataItemConfigs);
                
        logger.info(`Data delete jobs successfully queued for config: ${mainConfigId}`);
    } catch (error) {
        logger.error(`Error during delete and queue process for config ${options.mainConfigId}:`, error);
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

async function enqueueDataDeleteTasks(
    mainConfig: DataServiceConfig,
    runtimeConfig: DataServiceRuntimeConfig,
    dataItemConfigs: DataServiceDataSourceItemsConfig[]
): Promise<void> {
    const configId = mainConfig.id;
    const queueNames = getQueueNames(configId);

    logger.info(`Using data delete queue: ${queueNames.dataDeletion}`);

    const pushPromises: Promise<void>[] = [];

    for (const periodId of runtimeConfig.periods) {
        for (const config of dataItemConfigs) {
            const message: DataDeleteJob = {
                mainConfigId: configId,
                mainConfig,
                periodId,
                config,
                runtimeConfig,
            };

            pushPromises.push(
                pushToQueue(configId, 'dataDeletion', message, {
                    queuedAt: new Date().toISOString(),
                    operation: 'delete'
                })
            );
        }
    }

    await Promise.all(pushPromises);
    logger.info(`Successfully queued ${pushPromises.length} data delete jobs`);
}

export async function deleteData(jobData: any): Promise<void> {
    try {
        const { mainConfigId, mainConfig, periodId, config, runtimeConfig, overrideDimensions } = jobData;

        const mainConfigForClient = await fetchMainConfiguration(mainConfigId);
        const client = createDownloadClient({ config: mainConfigForClient });
        logger.info(`Processing delete job for config: ${mainConfigForClient.id}, period: ${periodId}, config: ${config.id}`);
        
        const shouldPaginate = await handleDeletePagination(jobData, client);
        if (shouldPaginate) {
            return;
        }
        await processDataDeletion(jobData, client);

    } catch (error: any) {
        logger.error(`Error processing data delete job:`, {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            }
        });
        throw error;
    }
}

async function handleDeletePagination(jobData: any, client: any): Promise<boolean> {
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

    logger.info(`Delete pagination needed for ${heavyDimension} (${baseDimensions[heavyDimension].length} items > ${pageSize})`);

    const chunks = chunk(baseDimensions[heavyDimension], pageSize);
    const limit = pLimit(10);

    await Promise.all(chunks.map(part => limit(async () => {
        const paginatedDimensions = {
            ...baseDimensions,
            [heavyDimension]: part,
        };

        await pushToQueue(mainConfigId, 'dataDeletion', {
            mainConfigId,
            mainConfig,
            periodId,
            config,
            runtimeConfig,
            overrideDimensions: paginatedDimensions,
        }, {
            queuedAt: new Date().toISOString(),
            paginatedFrom: heavyDimension,
            operation: 'delete'
        });
    })));

    logger.info(`Successfully queued ${chunks.length} paginated delete jobs`);
    return true;
}

async function processDataDeletion(jobData: any, client: any): Promise<void> {
    const { mainConfigId, mainConfig, periodId, config, runtimeConfig, overrideDimensions } = jobData;

    const dimensions = overrideDimensions || getDimensions({
        runtimeConfig,
        mappingConfig: config,
        periodId,
    });
    const data = await fetchPagedData({
        dimensions,
        filters: config.filters,
        client: dhis2Client,  
        timeout: runtimeConfig.timeout,
    });

    if (isEmpty(data.dataValues)) {
        logger.info(`No data found to delete in destination for ${config.id}: ${JSON.stringify(dimensions.dx?.slice(0, 5) || 'no dx')}`);
        return;
    }

    logger.info(`Found ${data.dataValues.length} data values in destination to delete for ${JSON.stringify(dimensions.dx?.slice(0, 5) || 'no dx')}`);

    const processedData = config.type === "ATTRIBUTE_VALUES"
        ? await processAttributeComboData({
            data,
            dataItemsConfig: config,
            categoryOptionId: head(
                config.filters![(config as DataServiceAttributeValuesDataItemsSource).attributeId]
            ) as string,
        })
        : await processDestinationDataForDeletion(data, config.dataItems);

    logger.info(`${processedData.dataValues.length} data values processed for deletion from destination`);

    if (!isEmpty(processedData.dataValues)) {
        await deleteDataValues(processedData.dataValues, mainConfigId);
        logger.info(`Successfully deleted ${processedData.dataValues.length} data values from destination`);
    }
}

async function processDestinationDataForDeletion(data: any, dataItems: any[]): Promise<any> {
    return {
        dataValues: data.dataValues
    };
}

async function deleteDataValues(dataValues: any[], configId: string): Promise<{ deleted: number; ignored: number }> {
    try {
        const deletionPayload = {
            dataValues: dataValues.map(dataValue => ({
                dataElement: dataValue.dataElement,
                period: dataValue.period,
                orgUnit: dataValue.orgUnit,
                categoryOptionCombo: dataValue.categoryOptionCombo,
                attributeOptionCombo: dataValue.attributeOptionCombo,
                value: dataValue.value
            }))
        };

        const url = `dataValueSets`;
        const params = {
            importStrategy: "DELETE",
            async: false,
        };
        const response = await dhis2Client.post(url, deletionPayload, { params });
        const importSummary = response.data?.response || response.data;
        
        if (!importSummary || !importSummary.importCount) {
            throw new Error("Invalid response from DHIS2 data deletion");
        }

        const deleted = importSummary.importCount.deleted || 0;
        const ignored = importSummary.importCount.ignored || 0;
        const updated = importSummary.importCount.updated || 0;
        const imported = importSummary.importCount.imported || 0;

        logger.info(`Deletion summary for config ${configId}: ${deleted} deleted, ${ignored} ignored, ${updated} updated, ${imported} imported`);

        if (ignored > 0) {
            logger.warn(`${ignored} data values were ignored during deletion`);
        }

        if (updated > 0 || imported > 0) {
            logger.warn(`Unexpected operation counts - updated: ${updated}, imported: ${imported} (should be 0 for DELETE strategy)`);
        }

        return { deleted, ignored };
    } catch (error: any) {
        logger.error(`Error during bulk data deletion for config ${configId}:`, error);
        throw error;
    }
}
