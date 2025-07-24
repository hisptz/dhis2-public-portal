import {
	DataDownloadSummary,
	DataServiceAttributeValuesDataItemsSource,
	DataServiceConfig,
	DataServiceDataSourceItemsConfig,
	DataServiceRuntimeConfig,
} from "@packages/shared/schemas";
import logger from "../logging";
import { AxiosError, AxiosInstance } from "axios";
import { compact, head, isEmpty } from "lodash";
import { asyncify, queue } from "async";
import {
	fetchPagedData,
	processAttributeComboData,
	processData,
	saveDataFile,
} from "@/utils/data";
import { Dimensions } from "@/schemas/metadata";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { createDownloadClient, dhis2Client } from "@/clients/dhis2";
import { checkOrCreateFolder } from "@/utils/files";
import {
	displayDownloadSummary,
	initializeDownloadSummary,
	initializeUploadSummary,
	updateSummaryFile,
} from "@/services/summary";
import { v4 } from "uuid";
import { completeUpload, initializeUploadQueue } from "@/services/data-upload";
import { dataDownloadQueues, dataUploadQueues } from "@/variables/queue";
import { downloadDataPerConfig } from "@/utils/download";

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
		const client = createDownloadClient({ config: mainConfig });
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
		await initializeDataDownloadQueue({
			client,
			mainConfig,
			runtimeConfig,
		});
		await initializeUploadQueue({
			configId: mainConfig.id,
		});
		for (const periodId of runtimeConfig.periods) {
			logger.info(`Setting up data download for period ${periodId}...`);
			for (const config of configs) {
				checkOrCreateFolder(`outputs/${mainConfigId}`);
				await downloadDataPerConfig({
					config,
					meta: {
						runtimeConfig,
						mainConfig,
						periodId,
					},
				});
			}
			logger.info(`Done!`);
		}
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

async function initializeDataDownloadQueue({
	client,
	mainConfig,
	runtimeConfig,
}: {
	client: AxiosInstance;
	mainConfig: DataServiceConfig;
	runtimeConfig: DataServiceRuntimeConfig;
}) {
	logger.info(`Initializing data download queue for ${mainConfig.id}`);
	dataDownloadQueues[mainConfig.id] = queue<{
		dimensions: Dimensions;
		filters?: Dimensions;
		config: DataServiceDataSourceItemsConfig;
	}>(
		asyncify(
			async ({
				dimensions,
				filters,
				config,
			}: {
				dimensions: Dimensions;
				filters?: Dimensions;
				config: DataServiceDataSourceItemsConfig;
			}) => {
				try {
					logger.info(
						`Downloading data for ${dimensions.pe?.length} periods and ${dimensions.dx?.length} data items`,
					);
					const data = await fetchPagedData({
						dimensions,
						filters,
						client,
						timeout: runtimeConfig.timeout,
					});
					logger.info(`Data downloaded`);
					if (isEmpty(data.dataValues)) {
						logger.info(
							`No data found for ${config.id}: ${dimensions.dx}`,
						);
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
						return;
					}
					logger.info(
						`Processing data for ${dimensions.id}: ${dimensions.dx}`,
					);
					const processedData =
						config.type === "ATTRIBUTE_VALUES"
							? await processAttributeComboData({
									data,
									dataItemsConfig: config,
									categoryOptionId: head(
										filters![
											(
												config as DataServiceAttributeValuesDataItemsSource
											).attributeId
										],
									) as string,
								})
							: await processData({
									data,
									dataItems: config.dataItems,
								});

					logger.info(
						`${processedData.dataValues.length} data values processed for ${JSON.stringify(dimensions)}`,
					);
					const status = await saveDataFile({
						data: processedData.dataValues,
						config: mainConfig,
						itemsConfig: config,
					});
					logger.info(
						`Data saved for ${config.id}: ${dimensions.dx}`,
					);
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
					return status;
				} catch (e) {
					if (e instanceof AxiosError) {
						const summary: DataDownloadSummary = {
							type: "download",
							id: v4(),
							status: "FAILED",
							error: e.message,
							errorDetails: e.response?.data,
							dataItems: dimensions.dx!,
							periods: dimensions.pe!,
							timestamp: new Date().toISOString(),
						};
						await updateSummaryFile({
							...summary,
							configId: mainConfig.id,
						});
					}
					if (e instanceof Error) {
						logger.error(`Error downloading data: ${e.message}`);
						throw e;
					}
				}
			},
		),
	);
	const summary: DataDownloadSummary = {
		id: v4(),
		type: "download",
		status: "INIT",
		timestamp: new Date().toISOString(),
	};
	await updateSummaryFile({
		...summary,
		configId: mainConfig.id,
	});

	dataDownloadQueues[mainConfig.id].drain().then(async () => {
		const summary: DataDownloadSummary = {
			id: v4(),
			type: "download",
			status: "DONE",
			timestamp: new Date().toISOString(),
		};
		await updateSummaryFile({
			...summary,
			configId: mainConfig.id,
		});
		await displayDownloadSummary(mainConfig.id);
		const configId = mainConfig.id;
		if (dataUploadQueues[configId].idle()) {
			await completeUpload(configId);
		} else {
			dataUploadQueues[configId].drain().then(async () => {
				await completeUpload(configId);
			});
		}
	});
}
