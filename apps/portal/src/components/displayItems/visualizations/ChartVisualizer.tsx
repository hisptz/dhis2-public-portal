"use client";
import dynamic from "next/dynamic";
import HighchartsReact from "highcharts-react-official";
import { RefObject } from "react";
import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import { ErrorBoundary } from "react-error-boundary";
import { CardError } from "@/components/CardError";
import { CardLoading } from "@/components/CardLoading";

const NoSSRDHIS2Chart = dynamic(
	() =>
		import("@packages/shared/visualizations").then(
			({ ChartVisualizer }) => ({
				default: ChartVisualizer,
			}),
		),
	{
		ssr: false,
		loading: () => {
			return <CardLoading />;
		},
	},
);

export interface ChartVisualizerProps {
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	setRef: RefObject<HighchartsReact.RefObject | null>;
	colors: string[];
}

export function ChartVisualizer({
	analytics,
	visualization,
	setRef,
	colors,
}: ChartVisualizerProps) {
	return (
		<ErrorBoundary FallbackComponent={CardError}>
			<NoSSRDHIS2Chart
				colors={colors}
				setRef={setRef}
				visualization={visualization}
				analytics={analytics}
			/>
		</ErrorBoundary>
	);
}
