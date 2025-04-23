"use client";

import {
	getCascadeHighchartOverride,
	getChartLayout,
	getChartType,
} from "@/utils/visualizer";
import { chartColors } from "@packages/shared/constants";
import dynamic from "next/dynamic";
import HighchartsReact from "highcharts-react-official";
import { isEmpty } from "lodash";
import { RefObject } from "react";
import { Loader } from "@mantine/core";
import {
	AnalyticsData,
	ChartVisualizationItem,
	VisualizationConfig,
} from "@packages/shared/schemas";

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

export interface CascadeChartVisualizerProps {
	analytics: AnalyticsData;
	config: ChartVisualizationItem;
	visualization: VisualizationConfig;
	setRef: RefObject<HighchartsReact.RefObject | null>;
}

export function CascadeChartVisualizer({
	analytics,
	config,
	visualization,
	setRef,
}: CascadeChartVisualizerProps) {
	const layout = getChartLayout(visualization);
	return (
		<NoSSRDHIS2Chart
			setRef={setRef as any}
			containerProps={{
				style: {
					height: "100%",
				},
			}}
			analytics={analytics as any}
			config={{
				type: getChartType(visualization),
				layout,
				colors: chartColors,
				showFilterAsTitle: !isEmpty(layout.filter),
				highChartOverrides: (options) => {
					return getCascadeHighchartOverride({
						originalConfig: options,
						config: config,
					});
				},
			}}
		/>
	);
}
