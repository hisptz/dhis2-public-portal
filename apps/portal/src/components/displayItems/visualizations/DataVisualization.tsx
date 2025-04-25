import { ReadonlyURLSearchParams } from "next/navigation";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import { DataVisComponent } from "@/components/displayItems/visualizations/DataVisComponent";
import {
	ChartVisualizationItem,
	VisualizationConfig,
} from "@packages/shared/schemas";
import { getAppearanceConfig } from "@/utils/theme";

export interface MainVisualizationProps {
	searchParams?: ReadonlyURLSearchParams;
	config: ChartVisualizationItem;
	disableActions?: boolean;
}

export async function getDataVisualization(config: ChartVisualizationItem) {
	const { id } = config;
	const visualizationConfig = await dhis2HttpClient.get<VisualizationConfig>(
		`visualizations/${id}`,
		{
			params: {
				fields: "*,organisationUnits[id,path],rows[id,dimension,items],columns[id,dimension,items],filters[id,dimension,items]",
			},
		},
	);
	return {
		visualizationConfig,
	};
}

export async function DataVisualization({
	config,
	disableActions,
}: MainVisualizationProps) {
	const { visualizationConfig } = await getDataVisualization(config);
	const { appearanceConfig } = (await getAppearanceConfig())!;
	const colors = appearanceConfig.colors.chartColors;

	return (
		<DataVisComponent
			colors={colors}
			disableActions={disableActions}
			config={config}
			visualizationConfig={visualizationConfig}
		/>
	);
}
