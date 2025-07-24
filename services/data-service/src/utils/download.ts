import {
	DataServiceAttributeValuesDataItemsSource,
	DataServiceConfig,
	DataServiceDataSourceItemsConfig,
	DataServiceRuntimeConfig,
} from "@packages/shared/schemas";
import logger from "@/logging";
import { getDimensions } from "@/utils/dimensions";
import { dataDownloadQueues } from "@/variables/queue";
import { chunk } from "lodash";
import { categoriesMeta } from "@/variables/meta";
import { getCategoryMetadata } from "@/utils/metadata";

export async function downloadDataForDxItems({
	config,
	meta,
}: {
	config: DataServiceDataSourceItemsConfig;
	meta: {
		runtimeConfig: DataServiceRuntimeConfig;
		mainConfig: DataServiceConfig;
		periodId: string;
	};
}) {
	try {
		const dimensions = getDimensions({
			runtimeConfig: meta.runtimeConfig,
			mappingConfig: config,
			periodId: meta.periodId,
		});
		const heavyDimension = meta.runtimeConfig.paginateByData
			? "dx"
			: Object.keys(dimensions).reduce((acc, value) => {
					if (
						(dimensions[acc]?.length ?? 0) >
						(dimensions[value]?.length ?? 0)
					)
						return acc;
					return value;
				}, Object.keys(dimensions)[0]);
		const pageSize = meta.runtimeConfig.pageSize ?? 50;

		if (dimensions[heavyDimension]?.length! <= pageSize) {
			logger.info(
				`Heavy dimension is small enough to download all at once`,
			);
			await dataDownloadQueues[meta.mainConfig.id].push({
				dimensions,
				config,
			});
			logger.info(`Download complete`);
			return;
		}
		logger.info(
			`Done. Heavy dimension is ${heavyDimension}. Data will be fetched by paginating ${heavyDimension} in chunks of ${pageSize}`,
		);
		const iterations = chunk(dimensions[heavyDimension], pageSize);
		for (const iteration of iterations) {
			const paginatedDimensions = {
				...dimensions,
				[heavyDimension]: iteration,
			};
			dataDownloadQueues[meta.mainConfig.id].push({
				dimensions: paginatedDimensions,
				config: config,
			});
		}
	} catch (e) {
		if (e instanceof Error) {
			logger.error(
				`Could not download data for ${config.id}: ${e.message}`,
			);
		}
		throw e;
	}
}

export async function downloadDataForAttributeItems({
	config,
	meta,
}: {
	config: DataServiceAttributeValuesDataItemsSource;
	meta: {
		runtimeConfig: DataServiceRuntimeConfig;
		mainConfig: DataServiceConfig;
		periodId: string;
	};
}) {
	try {
		logger.info(`Getting details for category ${config.attributeId}`);
		categoriesMeta[config.attributeId] = await getCategoryMetadata(
			config.attributeId,
		);
		if (!categoriesMeta[config.attributeId]) {
			logger.error(`Could not get metadata for ${config.attributeId}`);
			throw Error(`Could not get metadata for ${config.attributeId}`);
		}
		logger.info(`Details retrieved for category ${config.attributeId}`);
		const dimensions = getDimensions({
			runtimeConfig: meta.runtimeConfig,
			mappingConfig: config,
			periodId: meta.periodId,
		});
		const heavyDimension = meta.runtimeConfig.paginateByData
			? "dx"
			: Object.keys(dimensions).reduce((acc, value) => {
					if (
						(dimensions[acc]?.length ?? 0) >
						(dimensions[value]?.length ?? 0)
					)
						return acc;
					return value;
				}, Object.keys(dimensions)[0]);
		const pageSize = meta.runtimeConfig.pageSize ?? 50;
		const categoryOptions = config.attributeOptions;
		const iterations = chunk(dimensions[heavyDimension], pageSize);

		logger.info(
			`Expected iterations ${iterations.length} for ${heavyDimension} with ${categoryOptions.length} options`,
		);
		for (const categoryOption of categoryOptions) {
			logger.info(`Downloading data for ${categoryOption}`);
			for (const iteration of iterations) {
				const paginatedDimensions = {
					...dimensions,
					[heavyDimension]: iteration,
				};
				logger.info(
					`Downloading data for dimensions ${JSON.stringify(paginatedDimensions)} and filter ${JSON.stringify(
						{
							[config.attributeId]: [categoryOption],
						},
					)}`,
				);
				dataDownloadQueues[meta.mainConfig.id].push({
					dimensions: paginatedDimensions,
					filters: {
						[config.attributeId]: [categoryOption],
					},
					config,
				});
			}
		}
	} catch (e) {
		if (e instanceof Error) {
			logger.error(
				`Could not download data for ${config.id}: ${e.message}`,
			);
		}
		throw e;
	}
}

export async function downloadDataPerConfig({
	config,
	meta,
}: {
	config: DataServiceDataSourceItemsConfig;
	meta: {
		runtimeConfig: DataServiceRuntimeConfig;
		mainConfig: DataServiceConfig;
		periodId: string;
	};
}) {
	switch (config.type) {
		case "ATTRIBUTE_VALUES":
			return downloadDataForAttributeItems({ config, meta });
		case "DX_VALUES":
			return downloadDataForDxItems({ config, meta });
	}
}
