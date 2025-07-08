import {
	AnalyticsData,
	VisualizationChartType,
	YearOverYearVisualizationConfig,
} from "@packages/shared/schemas";
import React, { RefObject, useMemo } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { PeriodUtility } from "@hisptz/dhis2-utils";
import { uniq } from "lodash";

export interface YearOverYearChartVisualizerProps {
	analytics?: Map<string, AnalyticsData>;
	visualization: YearOverYearVisualizationConfig;
	colors: string[];
	setRef: RefObject<HighchartsReact.RefObject | null>;
}

export function YearOverYearVisualizer({
	analytics,
	visualization,
	colors,
	setRef,
}: YearOverYearChartVisualizerProps) {
	const series: Highcharts.SeriesOptionsType[] = useMemo(() => {
		if (!analytics) {
			return [];
		}
		return Array.from(analytics.entries()).map(([key, value]) => {
			const rows = value.rows;
			const valueIndex = value.headers.findIndex(
				({ name }) => name === "value",
			);
			const categories = value.metaData?.dimensions?.pe ?? [];
			return {
				name: PeriodUtility.getPeriodById(key).name,
				data: categories.map((category) => {
					const row = rows.find((row) => row.includes(category));

					if (!row) {
						return null;
					}

					return parseFloat(row[valueIndex]!);
				}),
			} as Highcharts.SeriesOptionsType;
		});
	}, [analytics]);

	const categories = useMemo(() => {
		if (!analytics) {
			return [];
		}
		const allCategories = Array.from(analytics.values())
			.map((value) => value.metaData?.dimensions?.pe ?? [])
			.flat();
		return uniq(allCategories).map(
			(category) => PeriodUtility.getPeriodById(category).name,
		);
	}, [analytics]);

	const options: Highcharts.Options = useMemo(() => {
		const chartType =
			visualization?.type === VisualizationChartType.YEAR_OVER_YEAR_LINE
				? "line"
				: "column";
		return {
			chart: { type: chartType },
			title: { text: "" },
			xAxis: { categories, title: { text: "" } },
			yAxis: { title: { text: "" } },
			series,
			legend: { enabled: true },
			tooltip: { shared: true },
			credits: { enabled: false },
			exporting: {
				sourceWidth: 1200,
				buttons: {
					contextButton: {
						enabled: false,
					},
				},
			},
			colors,
		};
	}, [series, categories]);

	return (
		<div style={{ width: "100%", height: `100%` }}>
			<HighchartsReact
				allowChartUpdate
				containerProps={{ style: { height: "100%" } }}
				highcharts={Highcharts}
				options={options}
				ref={setRef}
			/>
		</div>
	);
}
