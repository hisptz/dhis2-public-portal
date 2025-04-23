"use client";

import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import {
	getChartLayout,
	getChartType,
	getPyramidHighchartOverride,
} from "@/utils/visualizer";
import { chartColors } from "@packages/shared/constants";
import dynamic from "next/dynamic";
import { Loader } from "@mantine/core";
import HighchartsReact from "highcharts-react-official";
import { isEmpty } from "lodash";
import { RefObject } from "react";

const NoSSRDHIS2Chart = dynamic(
	() =>
		import("@hisptz/dhis2-analytics").then(({ DHIS2Chart }) => ({
			default: DHIS2Chart,
		})),
	{
		ssr: false,
		loading: () => {
			return (
				<div className="w-full h-full flex items-center justify-center min-h-[400px]">
					<Loader color="blue" />
				</div>
			);
		},
	},
);

export interface PyramidChartVisualizerProps {
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	setRef: RefObject<HighchartsReact.RefObject | null>;
}

export function PyramidChartVisualizer({
	analytics,
	visualization,
	setRef,
}: PyramidChartVisualizerProps) {
	const layout = getChartLayout(visualization);
	return (
		<NoSSRDHIS2Chart
			setRef={setRef as any}
			containerProps={{
				style: {
					height: "100%",
					minHeight: 500,
				},
			}}
			analytics={analytics as any}
			config={{
				type: getChartType(visualization),
				layout,
				colors: chartColors,
				showFilterAsTitle: !isEmpty(layout.filter),
				highChartOverrides: (options) => {
					return getPyramidHighchartOverride({
						originalConfig: options,
					});
				},
			}}
		/>
	);
}
