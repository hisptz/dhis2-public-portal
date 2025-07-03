import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import React, { memo, RefObject, useRef } from "react";
import HighchartsReact from "highcharts-react-official";
import { DHIS2Chart } from "@hisptz/dhis2-analytics";
import { getChartLayout, getChartType } from "@packages/shared/utils";
import { useResizeObserver } from "usehooks-ts";
import { CircularLoader } from "@dhis2/ui";
import { useVisualizationLegendSet } from "@packages/shared/hooks";

export interface ChartVisualizerProps {
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	colors: string[];
	setRef: RefObject<HighchartsReact.RefObject | null>;
}

export const ChartVisualizer = memo(function ChartVisualizer({
	analytics,
	visualization,
	colors,
	setRef,
}: ChartVisualizerProps) {
	const type = getChartType(visualization);
	const layout = getChartLayout(visualization);
	const { loading, legendSet } = useVisualizationLegendSet(visualization);

	const ref = useRef<HTMLDivElement>(null);
	const { height = 0 } = useResizeObserver<HTMLDivElement>({
		// @ts-expect-error ref will always have a nullable value
		ref: ref!,
		box: "border-box",
	});

	return loading ? (
		<div className="flex justify-center items-center h-full">
			<CircularLoader />
		</div>
	) : (
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
					legendSet,
					layout,
					height: height,
					showFilterAsTitle: false,
					name: visualization.displayName,
					allowChartTypeChange: false,
				}}
			/>
		</div>
	);
});
