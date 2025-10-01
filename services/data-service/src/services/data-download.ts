import {
    DataServiceConfig,
    DataServiceDataSourceItemsConfig,
    DataServiceRuntimeConfig,
} from "@packages/shared/schemas";
import logger from "../logging";
import { AxiosError } from "axios";
import { compact, isEmpty } from "lodash";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { createDownloadClient, dhis2Client } from "@/clients/dhis2";
import { checkOrCreateFolder } from "@/utils/files";
import { pushToDownloadQueue} from "@/rabbit/publisher";
import { getQueueStatus } from "./status";
import { processDataItems } from "@/utils/data";

export async function initializeDataDownload({
    mainConfigId,
    dataItemsConfigIds,
    runtimeConfig,
}: {
    mainConfigId: string;
    dataItemsConfigIds: Array<string>;
    runtimeConfig: DataServiceRuntimeConfig;
}) {
    try {
        logger.info(`Initializing data download for ${mainConfigId}`);
        logger.info(`Getting configuration from server for ${mainConfigId}...`);
        //We first get the configuration from the server
        const url = `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${mainConfigId}`;
        const response = await dhis2Client.get<DataServiceConfig>(url);
        logger.info(`Configuration retrieved from server for ${mainConfigId}`);
        const mainConfig = response.data;
        const configs = compact(
            dataItemsConfigIds.map((id) => {
                return mainConfig.itemsConfig.find(
                    ({ id: configId }) => configId === id,
                );
            }),
        );
        logger.info(
            `Data for ${configs.length} configurations will be downloaded`,
        );

        await enqueueDownloadTasks({
            mainConfig,
            runtimeConfig,
            configs,
        });


    } catch (e) {
        if (e instanceof AxiosError) {
            logger.error(
                `Could not get configuration ${mainConfigId} from server`,
            );
            logger.error(e.message);
            if (e.response?.data) {
                logger.error(JSON.stringify(e.response?.data));
            }
        }
        throw e;
    }
}

export async function waitForQueueToReceiveMessages(
    queueName: string,
    {
        pollInterval = 500,
        maxWaitTimeMs = 10000,
    }: { pollInterval?: number; maxWaitTimeMs?: number } = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        let waited = 0;

        const interval = setInterval(async () => {
            try {
                const status = await getQueueStatus(queueName);
                const messages = typeof status?.messages === "number" ? status.messages : 0;

                if (messages > 0) {
                    clearInterval(interval);
                    resolve();
                } else {
                    waited += pollInterval;

                    if (waited >= maxWaitTimeMs) {
                        clearInterval(interval);
                        reject(
                            new Error(
                                `Timeout: No messages received in queue "${queueName}" after ${maxWaitTimeMs}ms`
                            )
                        );
                    }
                }
            } catch (error) {
                clearInterval(interval);
                reject(
                    new Error(
                        `Error while polling queue "${queueName}": ${(error as Error).message}`
                    )
                );
            }
        }, pollInterval);
    });
}


export async function enqueueDownloadTasks({
    mainConfig,
    runtimeConfig,
    configs,
}: {
    mainConfig: DataServiceConfig;
    runtimeConfig: DataServiceRuntimeConfig;
    configs: DataServiceDataSourceItemsConfig[];
}) {
    const configId = mainConfig.id;

    const sourceClient = createDownloadClient({ config: mainConfig });

    checkOrCreateFolder(`outputs/${configId}`);

    const pushPromises: Promise<void>[] = [];

    const sanitezedConfigs: DataServiceDataSourceItemsConfig[] = [];

    for (const config of configs) {
        logger.info(`Processing configuration ${config.id} data items, please wait...`);
        const expandedDataItems = await processDataItems({
            mappings: config.dataItems,
            sourceClient,
            destinationClient: dhis2Client,
            timeout: runtimeConfig.timeout,
        });
        const sanitezedConfig = { ...config, dataItems: expandedDataItems };

        if (isEmpty(sanitezedConfig.dataItems)) {
            logger.warn(`Configuration ${config.id} has no data items after dissaggregation. Skipping...`);
        }

        logger.info(`Configuration ${config.id} has ${expandedDataItems.length} data items after dissaggregation.`);

        sanitezedConfigs.push(sanitezedConfig);
    }

    for (const periodId of runtimeConfig.periods) {
        for (const config of sanitezedConfigs) {
            const message = {
                mainConfigId: configId,
                mainConfig,
                periodId,
                config,
                runtimeConfig,
            };
            pushPromises.push(pushToDownloadQueue(message));
        }
    }

    await Promise.all(pushPromises);

}