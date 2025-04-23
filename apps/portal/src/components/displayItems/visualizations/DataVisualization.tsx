import { ReadonlyURLSearchParams } from "next/navigation";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import { DataVisComponent } from "@/components/displayItems/visualizations/DataVisComponent";
import {
	VisualizationItem,
	VisualizationConfig,
	ChartVisualizationItem,
} from "@packages/shared/schemas";

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

	return (
		<DataVisComponent
			disableActions={disableActions}
			config={config}
			visualizationConfig={visualizationConfig}
		/>
	);
}
