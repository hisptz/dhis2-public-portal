import logger from "../logging";
import { AxiosError, AxiosInstance } from "axios";
import {
	DataServiceAttributeValuesDataItemsSource,
	DataServiceConfig,
	DataServiceDataItemConfig,
	DataServiceDataSourceItemsConfig,
} from "@packages/shared/schemas";
import { v4 } from "uuid";
import { Dimensions } from "@/schemas/metadata";
import { isEmpty } from "lodash";
import { categoriesMeta } from "@/variables/meta";

export interface DataResponse {
	dataValues: Array<{
		comment: string;
		created: string;
		dataElement: string;
		lastUpdated: string;
		orgUnit: string;
		period: string;
		storedBy: string;
		value: string;
	}>;
}

type DataValuePayload = {
	dataElement: string;
	period: string;
	orgUnit: string;
	value: string;
	attributeOptionCombo?: string;
};

export async function fetchPagedData({
	dimensions,
	filters,
	client,
	timeout,
}: {
	dimensions: Dimensions;
	filters?: Dimensions;
	client: AxiosInstance;
	timeout?: number;
}) {
	try {
		const url = `analytics/dataValueSet.json`;
		const params = new URLSearchParams();
		Object.keys(dimensions).forEach((key) => {
			if (!isEmpty(dimensions[key])) {
				params.append(
					"dimension",
					`${key}:${dimensions[key]?.join(";")}`,
				);
			}
		});
		if (!isEmpty(filters)) {
			Object.keys(filters).forEach((key) => {
				if (!isEmpty(filters[key])) {
					params.append(
						"filter",
						`${key}:${filters[key]?.join(";")}`,
					);
				}
			});
		}
		const response = await client.get<DataResponse>(url, {
			params,
			timeout,
			timeoutErrorMessage: `Data fetch timed out after ${timeout}ms for data items: ${dimensions.dx?.join(",")}, periods: ${dimensions.pe?.join(",")} and org unit ${dimensions.ou?.join(", ")} & filters: ${filters?.dx?.join(",")}`,
		});
		return {
			dataValues: response.data.dataValues.filter(
				({ value }) => !isNaN(Number(value)),
			),
		};
	} catch (e) {
		if (e instanceof AxiosError) {
			logger.error(`Error fetching data: ${e.message}`);
			logger.error(
				`Status code: ${e.response?.status} - ${e.response?.statusText}`,
			);
			throw e;
		} else {
			if (e instanceof Error) {
				logger.error(`Error fetching data: ${e.message}`);
			} else {
				logger.error(`Error fetching data: Unknown error`);
				logger.error(`Error: ${JSON.stringify(e)}`);
			}
			throw e;
		}
	}
}

/*
 * Processes data into values that include attributeOptionCombo
 *
 *
 * */
export async function processAttributeComboData({
	data,
	dataItemsConfig,
	categoryOptionId,
}: {
	data: DataResponse;
	dataItemsConfig: DataServiceAttributeValuesDataItemsSource;
	categoryOptionId: string;
}): Promise<DataResponse> {
	const categoryMeta = categoriesMeta[dataItemsConfig.attributeId];

	const categoryOptionConfig = categoryMeta.categoryOptions.find(
		({ id }) => id === categoryOptionId,
	);

	if (categoryOptionConfig === undefined) {
		throw new Error(
			`Category option ${categoryOptionId} not found or is not a part of the category ${categoryMeta.id}`,
		);
	}
	const dataValues = data.dataValues
		.map((value) => {
			return categoryOptionConfig.categoryOptionCombos.map(
				(categoryOptionCombo) => {
					return {
						...value,
						attributeOptionCombo: categoryOptionCombo.id,
					};
				},
			);
		})
		.flat();

	return {
		dataValues,
	};
}

export async function processData({
	data,
	dataItems,
}: {
	data: DataResponse;
	dataItems: Array<DataServiceDataItemConfig>;
}) {
	return {
		dataValues: data.dataValues.map((value) => {
			const config = dataItems.find(
				({ sourceId }) => sourceId === value.dataElement,
			);
			return {
				...value,
				dataElement: config?.id ?? value.dataElement,
			};
		}),
	};
}

export async function saveDataFile({
	data,
	config,
}: {
	data: DataValuePayload[];
	config: DataServiceConfig;
	itemsConfig: DataServiceDataSourceItemsConfig;
}): Promise<string> {
	const fileLocation = `outputs/${config.id}/${v4()}.json`;
	const payload = {
		dataValues: data,
	};
	await Bun.write(
		fileLocation,
		JSON.stringify({
			...payload,
		}),
		{ createPath: true },
	);
	logger.info(`Data saved to ${fileLocation}`);
	logger.info(`Queuing file for upload: ${fileLocation}`);
	return fileLocation;
}
