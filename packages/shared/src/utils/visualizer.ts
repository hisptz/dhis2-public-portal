import {
	AnalyticsDimensionSchema,
	DataDimensionItem,
	DimensionConfig,
	LegendSetConfig,
	VisualizationConfig,
} from "../schemas";
import {
	camelCase,
	compact,
	flattenDeep,
	fromPairs,
	get,
	isEmpty,
} from "lodash";
import { ChartType } from "@hisptz/dhis2-analytics";
import { LegendSet } from "@hisptz/dhis2-utils";

export function getLayout(visualization: VisualizationConfig): {
	rows: AnalyticsDimensionSchema[];
	columns: AnalyticsDimensionSchema[];
	filters: AnalyticsDimensionSchema[];
} {
	return {
		rows: visualization.rows.map((row) => row.dimension),
		columns: visualization.columns.map((col) => col.dimension),
		filters: visualization.filters.map((filter) => filter.dimension),
	};
}

export function getChartLayout(visualization: VisualizationConfig): {
	category: AnalyticsDimensionSchema[];
	series: AnalyticsDimensionSchema[];
	filter: AnalyticsDimensionSchema[];
} {
	return {
		category: visualization.rows.map((row) => row.dimension),
		series: visualization.columns.map((col) => col.dimension),
		filter: visualization.filters.map((filter) => filter.dimension) ?? [],
	};
}

export function getDataItems(visualization: VisualizationConfig): string[] {
	return visualization.dataDimensionItems.map((item) => {
		const dataItem = item[
			camelCase(item.dataDimensionItemType) as keyof typeof item
		] as DataDimensionItem;
		return dataItem!.id;
	});
}

export function getPeriods(visualization: VisualizationConfig) {
	const allDimensions = [
		...visualization.rows,
		...visualization.columns,
		...visualization.filters,
	];
	return flattenDeep(
		allDimensions
			.filter(({ dimension }) => dimension === "pe")
			.map((item) => item.items.map((item) => item.id)),
	);
}

export function getOrgUnits(visualization: VisualizationConfig): Array<string> {
	const allDimensions = [
		...visualization.rows,
		...visualization.columns,
		...visualization.filters,
	];
	return flattenDeep(
		allDimensions
			.filter(({ dimension }) => dimension === "ou")
			.map((item) => item.items.map((item) => item.id)),
	);
}

export function getChartType(config: VisualizationConfig): ChartType {
	if (config.type.match(/YEAR_OVER_YEAR_/)) {
		return config.type
			.replace("YEAR_OVER_YEAR_", "")
			.toLowerCase()
			.replace("_", "-") as ChartType;
	}
	return config.type.toLowerCase().replace("_", "-") as ChartType;
}

export function getVisualizationLegendSet(
	config: VisualizationConfig,
): LegendSetConfig | undefined {
	if (!config.legend) {
		return;
	}
	const legendConfig = config.legend;
	switch (legendConfig.strategy) {
		case "FIXED":
			if (!legendConfig.set?.id) {
				return;
			}
			return legendConfig.set as LegendSet;
		case "BY_DATA_ITEM":
			return compact(
				config.dataDimensionItems.map((item) => {
					const dataItem = get(
						item,
						camelCase(item.dataDimensionItemType.toLowerCase()),
					);

					if (dataItem.legendSet) {
						return {
							dataItem: dataItem.id,
							legendSet: dataItem.legendSet as LegendSet,
						};
					}
					return undefined;
				}),
			);
	}
}

interface SelectedValues {
	searchParams?: Map<string, string>;
	selectedOrgUnits?: string[];
	selectedPeriods?: string[];
}

function getDimensionItems(
	dimension: DimensionConfig[],
	{ searchParams, selectedPeriods, selectedOrgUnits }: SelectedValues,
) {
	const orgUnitParams = !isEmpty(selectedOrgUnits)
		? selectedOrgUnits
		: searchParams?.get("ou")?.split(",");
	const periodParams = !isEmpty(selectedPeriods)
		? selectedPeriods
		: searchParams?.get("pe")?.split(",");
	return fromPairs(
		dimension.map((column) => {
			if (column.dimension === "ou") {
				if (isEmpty(orgUnitParams)) {
					return [
						column.dimension,
						column.items.map((item) => item.id),
					];
				}
				return [column.dimension, orgUnitParams!];
			}
			if (column.dimension === "pe") {
				if (isEmpty(periodParams)) {
					return [
						column.dimension,
						column.items.map((item) => item.id),
					];
				}
				return [column.dimension, periodParams!];
			}
			return [column.dimension, column.items.map((item) => item.id)];
		}),
	);
}

function getColumnItems(
	config: VisualizationConfig,
	selectedValues: SelectedValues,
) {
	return getDimensionItems(config.columns, selectedValues);
}

function getRowItems(
	config: VisualizationConfig,
	selectedValues: SelectedValues,
) {
	return getDimensionItems(config.rows, selectedValues);
}

function getFilterItems(
	config: VisualizationConfig,
	selectedValues: SelectedValues,
) {
	return getDimensionItems(config.filters, selectedValues);
}

export function getVisualizationDimensions(
	config: VisualizationConfig,
	selectedValues: SelectedValues,
): {
	[key: string]: Array<string>;
} {
	const rows = getRowItems(config, selectedValues);
	const columns = getColumnItems(config, selectedValues);

	return {
		...rows,
		...columns,
	};
}

export function getVisualizationFilters(
	config: VisualizationConfig,
	selectedValues: SelectedValues,
): {
	[key: string]: Array<string>;
} {
	return getFilterItems(config, selectedValues);
}
