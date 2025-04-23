"use client";
import { getChartLayout, getChartType } from "@/utils/visualizer";
import { chartColors } from "@packages/shared/constants";
import dynamic from "next/dynamic";
import { Loader } from "@mantine/core";
import HighchartsReact from "highcharts-react-official";
import { findIndex, head, isEmpty, set, sortBy } from "lodash";
import { RefObject } from "react";
import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import { LegendSet } from "@hisptz/dhis2-utils";
import { getLegendColorFromValue } from "@/utils/legends";
import { ErrorBoundary } from "react-error-boundary";
import { CardError } from "@/components/CardError";

const NoSSRDHIS2Chart = dynamic(
	() =>
		import("@hisptz/dhis2-analytics").then(({ DHIS2Chart }) => ({
			default: DHIS2Chart,
		})),
	{
		ssr: false,
		loading: () => {
			return (
				<div className="w-full h-full flex items-center justify-center min-h-[500px]">
					<Loader color="blue" />
				</div>
			);
		},
	},
);

export interface ChartVisualizerProps {
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	setRef: RefObject<HighchartsReact.RefObject | null>;
	legendSet?: LegendSet;
}

export function ChartVisualizer({
	analytics,
	visualization,
	setRef,
	legendSet,
}: ChartVisualizerProps) {
	const layout = getChartLayout(visualization);
	const series = visualization.series ?? [];
	const axes = visualization.axes ?? [];
	return (
		<ErrorBoundary FallbackComponent={CardError}>
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
					name: "Chart",
					customTitle: visualization.subtitle,
					showFilterAsTitle: !isEmpty(layout.filter),
					highChartOverrides: (options) => {
						const updatedOptions = options;
						if (!isEmpty(head(visualization.columns)!.items)) {
							set(
								updatedOptions,
								"series",
								sortBy(options.series, (seriesOptionType) =>
									findIndex(
										head(visualization.columns)!.items,
										{
											id: seriesOptionType.id,
										},
									),
								).map((series) => {
									if (series.type === "line") {
										return {
											...series,
											zIndex: 10,
										};
									}
									return series;
								}),
							);
						}

						if (legendSet) {
							set(
								updatedOptions,
								"series",
								updatedOptions.series?.map((series) => {
									return {
										...series,
										color: "#FFFFFF",
										// @ts-ignore
										data: series.data.map(
											(data: number, index: number) => {
												const color =
													getLegendColorFromValue({
														legendSet,
														value: data,
													});
												return {
													x: index,
													y: data,
													value: data,
													color: color,
												};
											},
										),
									};
								}),
							);
						}

						const yAxes = updatedOptions.yAxis;

						const updatedYAxes = Array.isArray(yAxes)
							? yAxes?.map((axis) => {
									return {
										...axis,
										min: 0,
									};
								})
							: yAxes;

						set(updatedOptions, "yAxis", updatedYAxes);

						return updatedOptions;
					},
					multiSeries: {
						yAxes: [0, 1, 2, 3].map((axis) => {
							const axisConfig = axes.find(
								(a) => a.index === axis,
							);

							if (!axisConfig) {
								if (axis === 0) {
									return {
										id: axis.toString(),
										title: {
											enabled: false,
										},
									};
								}

								if (series.find((s) => s.axis === axis)) {
									return {
										id: axis.toString(),
										type: "linear",
										opposite: true,
										visible: true,
										min: 0,
										title: {
											enabled: false,
										},
									};
								}

								return {
									id: axis.toString(),
									visible: false,
								};
							}

							return {
								id: axisConfig.index.toString(),
								type: "linear",
								opposite: axisConfig.index % 2 === 1,
								min: 0,
								title: {
									text: axisConfig.title?.text,
								},
							};
						}),
						series: series.map((series) => ({
							id: series.dimensionItem,
							as: (series.type?.toLowerCase() ?? "column") as
								| "column"
								| "line",
							yAxis: series.axis,
						})),
					},
				}}
			/>
		</ErrorBoundary>
	);
}
