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
import { isEmpty, isEqual, uniqWith } from "lodash";
import { categoriesMeta } from "@/variables/meta";
import { seq } from "async";

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


type Mapping = { id: string; sourceId: string };
type Expanded = { combo: string; id: string; name: string };


async function expandDataElement(
	client: AxiosInstance,
	element: string,
	timeout?: number
): Promise<Expanded[]> {
	if (element.includes(".")) {
		const [de, coc] = element.split(".");
		return [{ combo: element, id: coc, name: "" }];
	}

	const pipeline = seq(
		// Step 1: get categoryCombo id
		(deId: string, cb: any) => {
			client
				.get(`dataElements/${deId}?fields=categoryCombo`, {
					timeout,
					timeoutErrorMessage: `Timed out after ${timeout}ms fetching data element ${deId}`,
				})
				.then((res) => {
					cb(null, { deId, categoryComboId: res.data?.categoryCombo?.id });
				})
				.catch((err) => cb(err));
		},

		// Step 2: get categoryOptionCombos
		(input: { deId: string; categoryComboId: string }, cb: any) => {
			client
				.get(
					`categoryCombos/${input.categoryComboId}?fields=id,categoryOptionCombos`,
					{ timeout }
				)
				.then((res) => {
					cb(null, {
						deId: input.deId,
						optionCombos: res.data?.categoryOptionCombos ?? [],
					});
				})
				.catch((err) => cb(err));
		},

		// Step 3: fetch each categoryOptionCombo details
		(input: { deId: string; optionCombos: { id: string }[] }, cb: any) => {
			(async () => {
				try {
					const results: Expanded[] = [];
					for (const coc of input.optionCombos) {
						const res = await client.get(
							`categoryOptionCombos/${coc.id}?fields=id,name`,
							{ timeout }
						);
						results.push({
							combo: `${input.deId}.${res.data.id}`,
							id: res.data.id,
							name: res.data.name,
						});
					}
					cb(null, results);
				} catch (err) {
					cb(err);
				}
			})();
		}
	);

	return new Promise<Expanded[]>((resolve, reject) => {
		pipeline(element, (err: any, result: Expanded[]) => {
			if (err) return reject(err);
			resolve(result);
		});
	});
}



export async function processDataItems({
	mappings,
	sourceClient,
	destinationClient,
	timeout,
}: {
	mappings: Mapping[];
	sourceClient: AxiosInstance;
	destinationClient: AxiosInstance;
	timeout?: number;
}) {
	try {
		const results: Mapping[] = [];

		for (const { id, sourceId } of mappings) {
			const idExpanded = id.includes(".");
			const sourceExpanded = sourceId.includes(".");

			// Case 1: both already expanded -> keep as-is
			if (idExpanded && sourceExpanded) {
				results.push({ id, sourceId });
				continue;
			}


			// Case 2: expand whichever is not expanded
			const idCombos = await expandDataElement(destinationClient, id, timeout);
			const sourceCombos = await expandDataElement(sourceClient, sourceId, timeout);

			for (const idCoc of idCombos) {
				// Priority 1: match by ID
				const matchById = sourceCombos.find((s) => s.id === idCoc.id);
				if (matchById) {
					results.push({
						id: idCoc.combo,
						sourceId: matchById.combo,
					});
					continue; // skip name check
				}

				// Priority 2: match by name
				const matchByName = sourceCombos.find(
					(s) => s.name && s.name === idCoc.name,
				);
				if (matchByName) {
					results.push({
						id: idCoc.combo,
						sourceId: matchByName.combo,
					});
				}
			}
		}

		return uniqWith(results, isEqual);

	} catch (e) {
		if (e instanceof AxiosError) {
			console.error(`Axios Error fetching data: ${e.message}`);
			console.error(
				`Axios Status code: ${e.response?.status} - ${e.response?.statusText}`,
			);
			throw e;
		} else {
			if (e instanceof Error) {
				console.error(`Error fetching data: ${e.message}`);
			} else {
				console.error(`Error fetching data: Unknown error`);
				console.error(`Error: ${JSON.stringify(e)}`);
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
