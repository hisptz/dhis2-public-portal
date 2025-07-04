import React, { RefObject } from "react";

import HighchartsReact from "highcharts-react-official";
import {
	AnalyticsData,
	LegendSetConfig,
	VisualizationChartType,
	VisualizationConfig,
} from "@packages/shared/schemas";
import { SingleValueVisualizer } from "./SingleValueVisualizer";
import { TableVisualizer } from "./TableVisualizer";
import { ChartVisualizer } from "./ChartVisualizer";

export function ChartSelector({
	analytics,
	visualization,
	tableRef,
	setRef,
	fullScreen,
	colors,
	legendSetConfig,
}: {
	setRef: RefObject<HighchartsReact.RefObject | null>;
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	tableRef: RefObject<HTMLTableElement | null>;
	fullScreen: boolean;
	colors: string[];
	legendSetConfig?: LegendSetConfig;
}) {
	const chartType = visualization.type;
	switch (chartType) {
		case VisualizationChartType.SINGLE_VALUE:
			return (
				<SingleValueVisualizer
					visualization={visualization}
					analytics={analytics}
					colors={colors}
				/>
			);
		case VisualizationChartType.TABLE:
			return (
				<TableVisualizer
					fullScreen={fullScreen}
					setRef={tableRef}
					analytics={analytics}
					visualization={visualization}
				/>
			);
		default:
			return (
				<ChartVisualizer
					colors={colors}
					setRef={setRef}
					analytics={analytics}
					visualization={visualization}
					legendSet={legendSetConfig}
				/>
			);
	}
}
