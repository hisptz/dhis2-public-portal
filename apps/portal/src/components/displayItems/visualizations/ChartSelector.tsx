import HighchartsReact from "highcharts-react-official";
import { Dispatch, RefObject, SetStateAction } from "react";
import {
	AnalyticsData,
	SingleValueConfig,
	VisualizationConfig,
	VisualizationItem,
} from "@packages/shared/schemas";
import { SingleValueVisualizer } from "@/components/displayItems/SingleValueVisualizer/SingleValueVisualizer";
import { LegendSet } from "@hisptz/dhis2-utils";
import { TableVisualizer } from "../../../../../../packages/ui/src/visualizations/TableVisualizer";
import { ChartVisualizer } from "@/components/displayItems/visualizations/ChartVisualizer";

export function ChartSelector({
	analytics,
	visualization,
	tableRef,
	setRef,
	config,
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
		case "SINGLE_VALUE":
			return (
				<SingleValueVisualizer
					config={config as unknown as SingleValueConfig}
				/>
			);
		case "PIVOT_TABLE":
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
