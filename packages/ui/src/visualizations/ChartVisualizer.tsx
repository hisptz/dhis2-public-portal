import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import { RefObject } from "react";
import HighchartsReact from "highcharts-react-official";
import { DHIS2Chart } from "@hisptz/dhis2-analytics";
import { getChartLayout, getChartType } from "@packages/shared/utils";

export interface ChartVisualizerProps {
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	colors: string[];
	setRef: RefObject<HighchartsReact.RefObject | null>;
}

export function ChartVisualizer({
	analytics,
	visualization,
	colors,
	setRef,
}: ChartVisualizerProps) {
	const type = getChartType(visualization);
	const layout = getChartLayout(visualization);

	return (
		<DHIS2Chart
			analytics={analytics}
			setRef={setRef}
			containerProps={{
				style: {
					height: "100%",
					width: "100%",
				},
			}}
			config={{
				type,
				colors,
				layout,
				showFilterAsTitle: false,
				name: visualization.displayName,
				allowChartTypeChange: false,
			}}
		/>
	);
}
