"use client";

import {
	AnalyticsData,
	VisualizationConfig,
} from "@packages/shared/schemas";
import dynamic from "next/dynamic";
import { Loader } from "@mantine/core";
import { isEmpty } from "lodash";
import { RefObject } from "react";

const NoSSRDHIS2Table = dynamic(
	() =>
		import("@hisptz/dhis2-analytics").then(({ DHIS2PivotTable }) => ({
			default: DHIS2PivotTable,
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

export interface ChartVisualizerProps {
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	setRef: RefObject<HTMLTableElement | null>;
	fullScreen: boolean;
}

export function TableVisualizer({
	analytics,
	visualization,
	setRef,
	fullScreen,
}: ChartVisualizerProps) {
	return (
		<NoSSRDHIS2Table
			setRef={setRef as any}
			tableProps={{
				scrollHeight: fullScreen
					? `calc(100dvh - 96px)`
					: `calc(100% - 48px)`,
			}}
			analytics={analytics as any}
			config={{
				options: {
					fixColumnHeaders: true,
					fixRowHeaders: true,
					showFilterAsTitle: !isEmpty(visualization.filters),
				},
				layout: {
					columns: visualization.columns,
					filter: visualization.filters ?? [],
					rows: visualization.rows,
				},
			}}
		/>
	);
}
