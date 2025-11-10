import {
	AnalyticsData,
	LegendSetConfig,
	VisualizationConfig,
} from "../../schemas";
import React, { memo, RefObject, useRef } from "react";
import HighchartsReact from "highcharts-react-official";
import { DHIS2Chart } from "@hisptz/dhis2-analytics";
import {
	getChartLayout,
	getChartType,
	getVisualizationLegendSet,
} from "../../utils";
import { useResizeObserver } from "usehooks-ts";
import { isEmpty } from "lodash";

export interface ChartVisualizerProps {
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	colors: string[];
	setRef: RefObject<HighchartsReact.RefObject | null>;
	legendSet?: LegendSetConfig;
}

export const ChartVisualizer = memo(function ChartVisualizer({
	analytics,
	visualization,
	colors,
	setRef,
}: ChartVisualizerProps) {
	const type = getChartType(visualization);
	const layout = getChartLayout(visualization);
	const legendSet = getVisualizationLegendSet(visualization);

	const ref = useRef<HTMLDivElement>(null);
	const { height = 0 } = useResizeObserver<HTMLDivElement>({
		// @ts-expect-error ref will always have a nullable value
		ref: ref!,
		box: "border-box",
	});
	return (
		<div ref={ref} style={{ width: "100%", height: "100%" }}>
			<DHIS2Chart
				immutable
				containerProps={{
					style: {
						height: "100%",
					},
				}}
				analytics={analytics}
				// @ts-expect-error fixes on the lib
				setRef={setRef}
				config={{
					type,
					colors,
					layout,
					height: height,
					showFilterAsTitle: !isEmpty(visualization.filters),
					name: visualization.displayName,
					allowChartTypeChange: false,
					legendSet: legendSet,
				}}
			/>
		</div>
	);
});
