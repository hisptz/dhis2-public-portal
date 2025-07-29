import {
	DataDownloadSummary,
	DataServiceConfig,
	DataServiceDataSourceItemsConfig,
	DataServiceRuntimeConfig,
} from "@packages/shared/schemas";
import logger from "../logging";
import { AxiosError } from "axios";
import { compact} from "lodash";
import { DatastoreNamespaces } from "@packages/shared/constants";
import {  dhis2Client } from "@/clients/dhis2";
import { checkOrCreateFolder } from "@/utils/files";
import {
	displayDownloadSummary,
	initializeDownloadSummary,
	initializeUploadSummary,
	updateSummaryFile,
} from "@/services/summary";
import { v4 } from "uuid";
import { completeUpload } from "@/services/data-upload";
import { downloadQueue, pushToDownloadQueue, uploadQueue } from "@/rabbit/publisher";
import { startUploadWorker } from "@/rabbit/upload.worker";
import { waitForQueueToDrain } from "@/rabbit/queueMonitor";
import { getQueueStatus } from "./status";

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
		await initializeUploadSummary(mainConfigId, {
			runtimeConfig: {
				runtimeConfig: runtimeConfig,
				dataItemsConfigIds: dataItemsConfigIds,
			},
		});
		await initializeDownloadSummary(mainConfigId, {
			runtimeConfig: {
				runtimeConfig: runtimeConfig,
				dataItemsConfigIds: dataItemsConfigIds,
			},
		});
		await updateSummaryFile({
			id: v4(),
			type: "download",
			status: "INIT",
			timestamp: new Date().toISOString(),
			configId: mainConfigId,
		});

	    await startUploadWorker(mainConfigId);

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
    const queueName = downloadQueue + configId;

    checkOrCreateFolder(`outputs/${configId}`);

    const pushPromises: Promise<void>[] = [];

    for (const periodId of runtimeConfig.periods) {
        for (const config of configs) {
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

	await waitForQueueToReceiveMessages(queueName);

    await waitForQueueToDrain({ queueName });

    const summary: DataDownloadSummary = {
        id: v4(),
        type: "download",
        status: "DONE",
        timestamp: new Date().toISOString(),
    };

    await updateSummaryFile({
        ...summary,
        configId,
    });

    await displayDownloadSummary(configId);

    const uploadQueueName = uploadQueue + configId;

	await waitForQueueToReceiveMessages(uploadQueueName);
    await waitForQueueToDrain({ queueName: uploadQueueName });

    await completeUpload(configId);
}