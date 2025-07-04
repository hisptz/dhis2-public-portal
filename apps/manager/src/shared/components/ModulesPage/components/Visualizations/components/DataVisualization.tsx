import {
	ChartVisualizationItem,
	VisualizationChartType,
} from "@packages/shared/schemas";
import { useVisualizationConfig } from "../../../hooks/visualization";
import React from "react";
import { useAppearance } from "../../../hooks/appearance";
import { FullLoader } from "../../../../FullLoader";
import { YearOverYearDataVisComponent } from "./YearOverYearComponent/YearOverYearDataVisComponent";
import { DataVisComponent } from "./DataVisComponent";

export interface MainVisualizationProps {
	config: ChartVisualizationItem;
}

export function DataVisualization({ config }: MainVisualizationProps) {
	const { id } = config;
	const { visualizationConfig, loading, error } = useVisualizationConfig(id);
	const { appearance } = useAppearance();
	const colors = appearance?.colors.chartColors ?? [];

	if (loading) {
		return <FullLoader />;
	}

	if (error || !visualizationConfig) {
		throw new Error(error || "Could not get visualization details");
	}

	return (
		<>
			{[
				VisualizationChartType.YEAR_OVER_YEAR_COLUMN,
				VisualizationChartType.YEAR_OVER_YEAR_LINE,
			].includes(visualizationConfig.type) ? (
				<YearOverYearDataVisComponent
					colors={colors}
					disableActions={false}
					config={config}
					visualizationConfig={visualizationConfig}
				/>
			) : (
				<DataVisComponent
					colors={colors}
					config={config}
					visualizationConfig={visualizationConfig}
				/>
			)}
		</>
	);
}
