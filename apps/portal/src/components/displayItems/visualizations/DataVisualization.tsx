import { ReadonlyURLSearchParams } from "next/navigation";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import {
	ChartVisualizationItem,
	LegendSetConfig,
	VisualizationChartType,
	VisualizationConfig,
} from "@packages/shared/schemas";
import { getAppearanceConfig } from "@/utils/config/appConfig";
import { YearOverYearDataVisComponent } from "@/components/displayItems/visualizations/YearOverYearDataVisComponent";
import { DataVisComponent } from "@/components/displayItems/visualizations/DataVisComponent";
import { LegendSet } from "@hisptz/dhis2-utils";
import { camelCase, compact, get } from "lodash";

export interface MainVisualizationProps {
	searchParams?: ReadonlyURLSearchParams;
	config: ChartVisualizationItem;
	showFilter?: boolean;
	disableActions?: boolean;
}

async function getVisualizationLegendSet(
	config: VisualizationConfig,
): Promise<LegendSetConfig | undefined> {
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

export async function getDataVisualization(config: ChartVisualizationItem) {
	const { id } = config;
	const visualizationConfig = await dhis2HttpClient.get<VisualizationConfig>(
		`visualizations/${id}`,
		{
			params: {
				fields: "*,legend[*,set[id,displayName,legends[*]]]organisationUnits[id,path],rows[id,dimension,items],columns[id,dimension,items],filters[id,dimension,items],dataDimensionItems[*,indicator[id,displayName,legendSet[id,displayName,legends[*]]],dataElement[id,displayName,legendSet[id,displayName,legends[*]]],programIndicator[id,displayName,legendSet[id,displayName,legends[*]]],reportingRate[id,displayName,legendSet[id,displayName,legends[*]]]]",
			},
		},
	);

	return {
		visualizationConfig,
		legendSetConfig: await getVisualizationLegendSet(visualizationConfig),
	};
}

export async function DataVisualization({
	config,
	disableActions,
	showFilter,
}: MainVisualizationProps) {
	const { visualizationConfig, legendSetConfig } =
		await getDataVisualization(config);
	const { appearanceConfig } = (await getAppearanceConfig())!;
	const colors = appearanceConfig.colors.chartColors;

	if (!visualizationConfig) {
		console.error(
			`Could not get visualization details for visualization ${config.id}`,
		);
		throw Error("Could not get visualization details");
	}

	if (
		[
			VisualizationChartType.YEAR_OVER_YEAR_COLUMN,
			VisualizationChartType.YEAR_OVER_YEAR_LINE,
		].includes(visualizationConfig.type)
	) {
		return (
			<YearOverYearDataVisComponent
				colors={colors}
				disableActions={disableActions}
				config={config}
				showFilter={showFilter}
				visualizationConfig={visualizationConfig}
			/>
		);
	}

	return (
		<DataVisComponent
			legendSetConfig={legendSetConfig}
			showFilter={showFilter}
			colors={colors}
			disableActions={disableActions}
			config={config}
			visualizationConfig={visualizationConfig}
		/>
	);
}
