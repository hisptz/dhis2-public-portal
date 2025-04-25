import {
	AnalyticsDimensionSchema,
	DataDimensionItem,
	DimensionConfig,
	VisualizationConfig,
} from "../schemas";
import { camelCase, flattenDeep, fromPairs, isEmpty } from "lodash";
import { ChartType } from "@hisptz/dhis2-analytics";

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
	return config.type.toLowerCase().replace("_", "-") as ChartType;
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

function getYearByYearDimension(
	config: VisualizationConfig,
	selectedValues: SelectedValues,
) {}

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
