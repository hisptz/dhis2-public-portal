import {
	camelCase,
	compact,
	difference,
	find,
	forEach,
	head,
	isEmpty,
	set,
	snakeCase,
	sortBy,
	uniq,
} from "lodash";
import Highcharts, {
	Options,
	SeriesOptionsType,
	XAxisOptions,
	YAxisOptions,
} from "highcharts";
import {
	AnalyticsDimension,
	ChartVisualizationItem,
	MapConfig,
	VisualizationConfig,
} from "@packages/shared/schemas";
import { ChartType } from "@hisptz/dhis2-analytics";

export function getLayout(visualization: VisualizationConfig) {
	return {
		rows: visualization.rows.map((row: any) => row.id),
		columns: visualization.columns.map((col: any) => col.id),
		filters: visualization.filters.map((filter: any) => filter.id),
	};
}

export function getChartLayout(visualization: VisualizationConfig): any {
	return {
		category: visualization.rows.map((row: any) => row.id),
		series: visualization.columns.map((col: any) => col.id),
		filter: visualization.filters.map((filter: any) => filter.id) ?? [],
	};
}

export function getDataItems(visualization: VisualizationConfig): string[] {
	return visualization.dataDimensionItems.map((item: any) => {
		const dataItem = item[camelCase(item.dataDimensionItemType)];
		return dataItem.dimensionItem ?? dataItem.id;
	});
}

export function getPeriods(visualization: VisualizationConfig) {
	const periods = visualization.periods.map(({ id }: { id: string }) => id);
	const relativePeriods = Object.keys(
		visualization.relativePeriods ?? {},
	).filter((key) => visualization.relativePeriods[key]);
	return [
		...periods,
		...relativePeriods.map((period) => snakeCase(period).toUpperCase()),
	];
}

export function getMapPeriods(mapConfig: MapConfig["mapViews"][number]) {
	const periods = mapConfig.periods.map(({ id }: { id: string }) => id);
	const relativePeriods = Object.keys(mapConfig.relativePeriods ?? {}).filter(
		(key) => mapConfig.relativePeriods[key],
	);
	return [
		...periods,
		...relativePeriods.map((period) => snakeCase(period).toUpperCase()),
	];
}

export function getOrgUnits(visualization: VisualizationConfig): Array<string> {
	const userOrgUnits = [];

	if (visualization.userOrganisationUnit) {
		userOrgUnits.push(`USER_ORGUNIT`);
	}
	if (visualization.userOrganisationUnitChildren) {
		userOrgUnits.push(`USER_ORGUNIT_CHILDREN`);
	}
	if (visualization.userOrganisationUnitGrandChildren) {
		userOrgUnits.push(`USER_ORGUNIT_GRANDCHILDREN`);
	}

	if (!isEmpty(userOrgUnits)) {
		return userOrgUnits;
	}
	const orgUnits = visualization.organisationUnits?.map(
		({ id }: { id: string }) => id,
	);

	const orgUnitLevels =
		visualization.organisationUnitLevels.map(
			(level: { id: string } | number) => {
				if (typeof level === "object") {
					return `LEVEL-${level.id}`;
				}
				return `LEVEL-${level}`;
			},
		) ?? [];
	const orgUnitGroups =
		visualization.itemOrganisationUnitGroups.map(
			({ id }: { id: string }) => `GROUP-${id}`,
		) ?? [];

	return [...orgUnits, ...orgUnitGroups, ...orgUnitLevels];
}

export function getOrgUnitSelection(visualization: VisualizationConfig): any {
	return {
		orgUnits: visualization.organisationUnits,
		userOrgUnit: visualization.userOrganisationUnit,
		userSubUnit: visualization.userOrganisationUnitChildren,
		userSubX2Unit: visualization.userOrganisationUnitGrandChildren,
		groups: visualization.itemOrganisationUnitGroups,
		levels: visualization.organisationUnitLevels,
	};
}

export function getMapOrgUnitSelection(
	visualization: VisualizationConfig,
): any {
	const orgUnitItems =
		visualization.rows.find(
			({ dimension }) => dimension === AnalyticsDimension.ou,
		)?.items ?? [];

	function getOrgUnitFromItems(orgUnitItems: { id: string }[]) {
		const levels = orgUnitItems
			.filter((item: { id: string }) =>
				item.id.toLowerCase().match(/level/),
			)
			?.map((item: { id: string }) => item.id);

		const groups = orgUnitItems
			.filter((item: { id: string }) =>
				item.id.toLowerCase().match(/group/),
			)
			?.map((item: { id: string }) => item.id);

		const ous = difference(
			orgUnitItems.map((item: { id: string }) => item.id),
			[...groups, ...levels],
		);

		return {
			orgUnits: ous,
			levels,
			groups,
		};
	}

	const { orgUnits, levels, groups } = getOrgUnitFromItems(orgUnitItems);

	return {
		orgUnits: [...visualization.organisationUnits, ...orgUnits],
		userOrgUnit: visualization.userOrganisationUnit,
		userSubUnit: visualization.userOrganisationUnitChildren,
		userSubX2Unit: visualization.userOrganisationUnitGrandChildren,
		groups: [...visualization.itemOrganisationUnitGroups, ...groups],
		levels: [...visualization.organisationUnitLevels, ...levels],
	};
}

export function getCategoryOptions(config: VisualizationConfig) {
	const categories = config.categoryDimensions;
	if (isEmpty(categories)) {
		return {};
	}

	const dimensions = {};

	forEach(categories, (category) => {
		set(
			dimensions,
			category.category.id,
			category.categoryOptions.map((option: { id: any }) => option.id),
		);
	});

	return dimensions;
}

export function getChartType(config: VisualizationConfig): ChartType {
	if (
		uniq(compact(config.series?.map((series) => series.type))).length >= 1
	) {
		return "multi-series";
	}
	if (
		uniq(compact(config.series?.map((series) => series.axis))).length >= 1
	) {
		return "multi-series";
	}
	return config.type.toLowerCase().replace("_", "-") as ChartType;
}

// export function getMultiSeries(config: ChartVisualizationItem) {
// 	const { axes } = config;
// 	const yAxes = axes.map((axis, index) => ({
// 		id: axis.id,
// 		title: {
// 			text: axis.name ?? "",
// 		},
// 		opposite: index % 2 === 1,
// 	}));
//
// 	const series = compact(
// 		axes
// 			.map((axis, index) => {
// 				if (axis.multiple) {
// 					return axis.ids?.map((id) => ({
// 						...axis,
// 						id,
// 						yAxis: index,
// 						as: (axis.type.toLowerCase() ?? "column") as
// 							| "column"
// 							| "line",
// 					}));
// 				}
// 				return {
// 					...axis,
// 					id: axis.id,
// 					yAxis: index,
// 					as: (axis.type.toLowerCase() ?? "column") as
// 						| "column"
// 						| "line",
// 				};
// 			})
// 			.flat(),
// 	);
// 	return {
// 		yAxes,
// 		series,
// 	};
// }

/*
 * This one needs some explanation in case I forget what I did.
 * Since cascade charts need the chart categories to have different axes, this functionality isn't supported by highchart as of 02/06/2023(Today).
 * So this is definitely not the best way to do it, it's a hack that works.
 * Steps:
 *  - Create the axes based on the provided config
 *  - Create 2 series, each from axis configuration.
 *  - The series data should be cleaned out. Only the represented category in an axis config should have data. Set the rest to null.
 *  - Add plot options, stacking the columns and remove dataLabels
 *
 * Voilà! you have a cascade chart
 * *
 * */

export function getCascadeHighchartOverride({
	config,
	originalConfig,
}: {
	config: ChartVisualizationItem;
	originalConfig: Options;
}): Partial<Options> {
	const { axes } = config;
	const yAxes = axes.map(
		(axis, index) =>
			({
				min: 0,
				id: axis.id,
				title: {
					text: axis.name ?? "",
				},
				opposite: index % 2 === 1,
				stackLabels: {
					enabled: true,
					verticalAlign: "top",
				},
			}) as YAxisOptions,
	);

	const series = originalConfig.series
		?.map((seriesOptions: SeriesOptionsType) => {
			if (!("data" in seriesOptions)) {
				return seriesOptions;
			}

			const seriesData = seriesOptions.data as number[];
			return axes
				.map((axis, axisIndex) => {
					if (axis.multiple) {
						if (axis.ids?.includes(seriesOptions.id as string)) {
							return axis.ids?.map((id) => ({
								...seriesOptions,
								yAxis: axisIndex,
								as: (axis.type.toLowerCase() ?? "column") as
									| "column"
									| "line",
							}));
						} else {
							const data = Array.from(
								Array(seriesData.length),
							).fill(null);

							forEach(axis.ids, (id, index) => {
								set(
									data,
									[index + axisIndex],
									seriesData?.[index + axisIndex],
								);
							});

							return {
								...seriesOptions,
								as: (axis.type.toLowerCase() ?? "column") as
									| "column"
									| "line",
								yAxis: axisIndex,
								color: chartColors[axisIndex],
								data,
							};
						}
					}

					if (axis.id === seriesOptions.id) {
						return {
							id: axis.id,
							yAxis: axisIndex,
							as: (axis.type.toLowerCase() ?? "column") as
								| "column"
								| "line",
						};
					}
					const data = Array.from(
						Array(seriesOptions.data?.length),
					).fill(null);
					set(data, [0], seriesData?.[0]);

					return {
						...seriesOptions,
						yAxis: axisIndex,
						as: (axis.type.toLowerCase() ?? "column") as
							| "column"
							| "line",
						data,
					};
				})
				.flat();
		})
		.flat() as SeriesOptionsType[];

	return {
		yAxis: yAxes,
		plotOptions: {
			...originalConfig.plotOptions,
			column: {
				...(originalConfig.plotOptions?.column ?? {}),
				dataLabels: {
					enabled: false,
				},
				stacking: "normal",
			},
		},
		series,
	};
}

function getDataWithCategories(config: Options, series: SeriesOptionsType) {
	if (!("data" in series)) {
		return [];
	}
	const categories = !Array.isArray(config.xAxis)
		? (config.xAxis?.categories ?? [])
		: [];

	return (series.data as number[])?.map((datum, index) => ({
		value: datum,
		category: categories[index],
	}));
}

const formatter = Intl.NumberFormat("en-GB", {
	maximumFractionDigits: 2,
	maximumSignificantDigits: 3,
	notation: "compact",
}).format;

const expandedFormatter = Intl.NumberFormat("en-GB", {
	maximumFractionDigits: 2,
	maximumSignificantDigits: 3,
	notation: "standard",
}).format;

export function getPyramidHighchartOverride({
	originalConfig,
}: {
	originalConfig: Options;
}): Partial<Highcharts.Options> {
	const dataWithCategories = getDataWithCategories(
		originalConfig,
		head(originalConfig.series)!,
	);
	const sortedCategories = sortBy(dataWithCategories, "value").map(
		({ category }) => category,
	);

	const updatedSeries = originalConfig.series?.map((series, index) => {
		//We need to sort the series data
		if (!("data" in series)) {
			return series;
		}
		const odd = index % 2 === 1;

		const dataWithCategories = getDataWithCategories(
			originalConfig,
			series,
		);

		const sortedData = sortedCategories.map((category) => {
			const data = find(dataWithCategories, { category: category });
			return data?.value;
		});

		return {
			...series,
			type: "bar",
			data: odd
				? sortedData?.map((value) => 0 - (value ?? 0))
				: sortedData,
		};
	});

	const yAxis: YAxisOptions = {
		...originalConfig.yAxis,
		labels: {
			formatter: (context) => {
				return formatter(Math.abs(context.value as number));
			},
		},
		minorTickWidth: 32,
		type: "category",
	};
	const xAxis: XAxisOptions[] = [
		{
			...originalConfig.xAxis,
			left: "51.4%",
			alignTicks: true,
			tickPosition: "outside",
			categories: sortedCategories,
			labels: {
				formatter: function (context) {
					return (
						"<span style='color: white;' >" +
						context.value +
						"</span>"
					);
				},
			},
		},
		{
			...originalConfig.xAxis,
			opposite: true,
			left: "-48.6%",
			linkedTo: 0,
			tickPosition: "outside",
			categories: sortedCategories,
			labels: {
				formatter: function (context) {
					return (
						"<span style='color: white;' >" +
						context.value +
						"</span>"
					);
				},
			},
		},
	];

	return {
		...originalConfig,
		yAxis,
		xAxis,
		chart: {
			type: "bar",
		},
		tooltip: {
			formatter: function () {
				return `<span >${this.point.category}</span><br/>${this.point.y ? expandedFormatter(Math.abs(this.point.y as number)) : this.point.y}`;
			},
		},
		plotOptions: {
			...originalConfig.plotOptions,
			series: {
				...(originalConfig.plotOptions?.column ?? {}),
				dataLabels: {
					enabled: false,
				},
				stacking: "normal",
			},
		} as Highcharts.PlotOptions,
		series: updatedSeries as Highcharts.SeriesOptionsType[],
	};
}

export function getVisualizationItems(
	config: VisualizationConfig,
	{
		searchParams,
		selectedOrgUnits,
		selectedPeriods,
	}: {
		searchParams?: Map<string, string>;
		selectedOrgUnits?: string[];
		selectedPeriods?: string[];
	},
) {
	const dataItems = getDataItems(config);

	const orgUnitParams = searchParams?.get("ou")?.split(",");
	const periodParams = searchParams?.get("pe")?.split(",");

	const periods = !isEmpty(selectedPeriods)
		? selectedPeriods
		: !isEmpty(periodParams)
			? periodParams
			: getPeriods(config);
	const orgUnits = !isEmpty(selectedOrgUnits)
		? selectedOrgUnits
		: !isEmpty(orgUnitParams)
			? orgUnitParams
			: getOrgUnits(config);
	const categories = getCategoryOptions(config);

	return {
		ou: orgUnits,
		pe: periods,
		dx: dataItems,
		...categories,
	};
}

export function getVisualizationDimensions(
	config: VisualizationConfig,
	{
		searchParams,
		selectedOrgUnits,
		selectedPeriods,
	}: {
		searchParams?: Map<string, string>;
		selectedOrgUnits?: string[];
		selectedPeriods?: string[];
	},
): {
	[key: string]: Array<string>;
} {
	const items = getVisualizationItems(config, {
		searchParams,
		selectedOrgUnits,
		selectedPeriods,
	});
	const dimensions = {};

	config.rows.forEach((row) => {
		set(dimensions, row.dimension, items[row.dimension]);
	});
	config.columns.forEach((col) => {
		set(dimensions, col.dimension, items[col.dimension]);
	});

	return dimensions;
}

export function getVisualizationFilters(
	config: VisualizationConfig,
	{
		searchParams,
		selectedPeriods,
		selectedOrgUnits,
	}: {
		searchParams?: Map<string, string>;
		selectedOrgUnits?: string[];
		selectedPeriods?: string[];
	},
): {
	[key: string]: Array<string>;
} {
	const items = getVisualizationItems(config, {
		searchParams,
		selectedPeriods,
		selectedOrgUnits,
	});

	const filters = {};

	config.filters.forEach((filter) => {
		set(filters, filter.dimension, items[filter.dimension]);
	});

	return filters;
}
