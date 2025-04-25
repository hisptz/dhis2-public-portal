import {
	AnalyticsDimensionSchema,
	DataDimensionItem,
	VisualizationConfig,
} from "../schemas";
import { camelCase, flattenDeep } from "lodash";
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
