"use client";

import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import { flatten, get, head, truncate } from "lodash";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { chartColors } from "@packages/shared/constants";
import { RefObject, useMemo } from "react";
import { Tooltip } from "@mantine/core";
import { useResizeObserver } from "usehooks-ts";
import { LegendSet } from "@hisptz/dhis2-utils";
import { getLegendColorFromValue } from "@/utils/legends";

export function GaugeVisualizer({
	analytics,
	setRef,
	visualization,
	containerRef,
	legendSet,
}: {
	analytics: AnalyticsData;
	setRef: RefObject<HighchartsReact.RefObject | null>;
	visualization: VisualizationConfig;
	containerRef: RefObject<HTMLDivElement | null>;
	legendSet?: LegendSet;
}) {
	const { rows, headers, metaData } = analytics;
	const valueHeaderIndex = headers.findIndex(({ name }) => name === "value");
	const value = parseFloat(get(head(rows), [valueHeaderIndex]) ?? "");
	const labels = visualization.subtitle
		? [visualization.subtitle]
		: visualization.filters.map((filter) => {
				const dimensions = metaData?.dimensions[filter.dimension] ?? [];
				return flatten(
					dimensions.map((dimension) => {
						const filterItem = metaData?.items[dimension];
						return filterItem?.name;
					}),
				);
			});

	const legendColor = useMemo(
		() =>
			getLegendColorFromValue({
				value,
				legendSet,
			}),
		[value, legendSet],
	);

	const getChartConfig = ({
		width,
		height,
	}: {
		width: number;
		height: number;
	}) => {
		return {
			chart: {
				type: "solidgauge",
				height,
				width,
			},
			title: null,
			pane: {
				startAngle: -90,
				endAngle: 89.9,
				center: ["50%", "60%"],
				size: Math.min(width - 16, height - 16),
				background: {
					backgroundColor: "#D1D5D8",
					borderRadius: 8,
					innerRadius: "60%",
					outerRadius: "100%",
					shape: "arc",
				} as Highcharts.PaneBackgroundOptions,
			} as Highcharts.PaneOptions,
			exporting: {
				enabled: false,
			},
			tooltip: {
				enabled: false,
			},

			// the value axis
			yAxis: {
				min: 0,
				max: 100,
				offset: 0,
				lineWidth: 0,
				minorTicks: false,
				width: width - 16,
				height: height - 16,
				tickWidth: 0,
				type: "linear",
				labels: {
					enabled: false,
					distance: 20,
					style: {
						fontSize: "14px",
					},
				},
				maxPadding: 0,
				pane: 0,
				minColor: legendColor ?? head(chartColors),
				maxColor: legendColor ?? head(chartColors),
				margin: 0,
			} as Highcharts.YAxisOptions,
			credits: {
				enabled: false,
			},
			plotOptions: {
				solidgauge: {
					borderRadius: 4,
					color: head(chartColors),
					dataLabels: {
						y: 5,
						borderWidth: 0,
						useHTML: true,
					},
					borderWidth: 0,
					borderColor: "white",
					innerRadius: "60%",
				},
			} as Highcharts.PlotOptions,
			series: [
				{
					name: visualization.name,
					data: [Math.round(value)],
					color: "white",
					dataLabels: {
						y: -70,
						style: {
							fontSize: "48px",
						},
						align: "center",
						verticalAlign: "end",
						format: "{y}%",
					},
					compare: "percent",
					tooltip: {
						valueSuffix: "%",
					},
				},
			] as Highcharts.SeriesGaugeOptions[],
		};
	};

	useResizeObserver({
		ref: containerRef as RefObject<HTMLDivElement>,
		onResize: ({ width, height }) => {
			if (width && height) {
				setRef?.current?.chart.update(
					getChartConfig({ width, height }) as any,
				);
			}
		},
	});

	const config = useMemo(() => {
		const height = containerRef.current?.clientHeight ?? 400;
		const width = containerRef.current?.clientWidth ?? 400;
		return getChartConfig({ width, height });
	}, [containerRef.current?.clientHeight, containerRef.current?.clientWidth]);

	return (
		<div className="w-full flex flex-col align-middle justify-center gap-2">
			<Tooltip label={labels.join(" - ")}>
				<span
					style={{ fontSize: 16 }}
					className="text-background-500 text-center"
				>
					{truncate(labels.join(" - "), {
						length: 50,
						omission: "...",
					})}
				</span>
			</Tooltip>
			<div className="flex-1">
				<HighchartsReact
					ref={setRef}
					allowChartUpdate
					immutable
					highcharts={Highcharts}
					options={{ ...config }}
				/>
			</div>
		</div>
	);
}
