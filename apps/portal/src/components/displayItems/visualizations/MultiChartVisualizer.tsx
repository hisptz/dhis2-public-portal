"use client";

import {
	AnalyticsData,
	ChartVisualizationItem,
	VisualizationConfig,
} from "@packages/shared/schemas";
import { getChartLayout, getChartType } from "@/utils/visualizer";
import { chartColors } from "@packages/shared/constants";
import dynamic from "next/dynamic";
import { Loader } from "@mantine/core";
import HighchartsReact from "highcharts-react-official";
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
				<div className="w-full h-full flex items-center justify-center">
					<Loader color="blue" />
				</div>
			);
		},
	},
);

export interface MultiChartVisualizerProps {
	analytics: AnalyticsData;
	config: ChartVisualizationItem;
	visualization: VisualizationConfig;
	setRef: RefObject<HighchartsReact.RefObject | null>;
}

export function MultiChartVisualizer({
	analytics,
	config,
	visualization,
	setRef,
}: MultiChartVisualizerProps) {
	return (
		<NoSSRDHIS2Chart
			analytics={analytics as any}
			setRef={setRef as any}
			config={{
				type: getChartType(visualization),
				layout: getChartLayout(visualization),
				colors: chartColors,
				multiSeries: {}, // getMultiSeries(config)
			}}
		/>
	);
}
