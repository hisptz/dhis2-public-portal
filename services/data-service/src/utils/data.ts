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
import * as fs from "node:fs";
import * as path from "node:path";

export interface DataResponse {
	dataValues: Array<{
		comment: string;
		created: string;
		categoryOptionCombo?: string;
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
		const queryParams: string[] = [];

		Object.keys(dimensions).forEach((key) => {
			if (!isEmpty(dimensions[key])) {
				const dimensionParam = `${key}:${dimensions[key]?.join(";")}`;
				queryParams.push(`dimension=${dimensionParam}`);
			}
		});

		if (!isEmpty(filters)) {
			Object.keys(filters).forEach((key) => {
				if (!isEmpty(filters[key])) {
					const filterParam = `${key}:${filters[key]?.join(";")}`;
					queryParams.push(`filter=${filterParam}`);
				}
			});
		}

		const queryString = queryParams.join('&');
		const fullUrl = queryString ? `${url}?${queryString}` : url;
		const response = await client.get<DataResponse>(fullUrl, {
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
			logger.error(`Axios Error fetching data: ${e.message}`);
			logger.error(
				`Axios Status code: ${e.response?.status} - ${e.response?.statusText}`,
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
			const config = dataItems.find(({ sourceId }) => {
				if (sourceId === value.dataElement) return true;

				if (sourceId.includes(".")) {
					const [de, coc] = sourceId.split(".");
					return de === value.dataElement && coc === value.categoryOptionCombo;
				}

				return false;
			});

			let newValue = { ...value };

			if (config) {
				if (config.id.includes(".")) {
					const [newDe, newCoc] = config.id.split(".");
					newValue.dataElement = newDe;
					newValue.categoryOptionCombo = newCoc;
				} else {
					newValue.dataElement = config.id;
				}
			}

			return newValue;
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


	const dir = path.dirname(fileLocation);
	await fs.promises.mkdir(dir, { recursive: true });

	await fs.promises.writeFile(
		fileLocation,
		JSON.stringify(payload, null, 2),
		'utf8'
	);

	logger.info(`Data saved to ${fileLocation}`);
	logger.info(`Queuing file for upload: ${fileLocation}`);
	return fileLocation;
}
