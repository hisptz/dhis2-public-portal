import HighchartsReact from "highcharts-react-official";
import { Dispatch, RefObject, SetStateAction } from "react";
import {
	AnalyticsData,
	VisualizationChartType,
	VisualizationConfig,
	VisualizationItem,
} from "@packages/shared/schemas";
import { LegendSet } from "@hisptz/dhis2-utils";
import { ChartVisualizer } from "@/components/displayItems/visualizations/ChartVisualizer";
import {
	SingleValueVisualizer,
	TableVisualizer,
} from "@packages/ui/visualizations";

export function ChartSelector({
	analytics,
	visualization,
	tableRef,
	setRef,
	fullScreen,
	colors,
}: {
	setSingleValueRef: Dispatch<SetStateAction<HTMLDivElement | null>>;
	setRef: RefObject<HighchartsReact.RefObject | null>;
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	legendSet?: LegendSet;
	config: VisualizationItem;
	tableRef: RefObject<HTMLTableElement | null>;
	containerRef: RefObject<HTMLDivElement | null>;
	fullScreen: boolean;
	colors: string[];
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
				/>
			);
	}
}
