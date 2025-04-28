import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import { RefObject, useRef } from "react";
import HighchartsReact from "highcharts-react-official";

export interface ChartVisualizerProps {
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	colors: string[];
	setRef: RefObject<HighchartsReact.RefObject | null>;
}

export function YearOverYearVisualizer({}: ChartVisualizerProps) {
	// const type = getChartType(visualization);
	// const layout = getChartLayout(visualization);

	const ref = useRef<HTMLDivElement>(null);
	// const { height = 0 } = useResizeObserver<HTMLDivElement>({
	// 	// @ts-expect-error ref will always have a nullable value
	// 	ref: ref!,
	// 	box: "border-box",
	// });

	return (
		<div ref={ref} style={{ width: "100%", height: "100%" }}>
			Support for year to year will be coming soon!
			{/*<DHIS2Chart*/}
			{/*	immutable*/}
			{/*	containerProps={{*/}
			{/*		style: {*/}
			{/*			height: "100%",*/}
			{/*		},*/}
			{/*	}}*/}
			{/*	// @ts-expect-error fixes on the lib*/}
			{/*	analytics={analytics}*/}
			{/*	// @ts-expect-error fixes on the lib*/}
			{/*	setRef={setRef}*/}
			{/*	config={{*/}
			{/*		type,*/}
			{/*		colors,*/}
			{/*		layout,*/}
			{/*		height: height,*/}
			{/*		showFilterAsTitle: false,*/}
			{/*		name: visualization.displayName,*/}
			{/*		allowChartTypeChange: false,*/}
			{/*		highChartOverrides: (options) => {*/}
			{/*			const series: SeriesOptions[] =*/}
			{/*				visualization.yearlySeries.map((yearId) => {*/}
			{/*					const year =*/}
			{/*						PeriodUtility.getPeriodById(yearId);*/}
			{/*					const periods =*/}
			{/*						analytics.metaData.dimensions.pe.filter(*/}
			{/*							(pe) => pe.includes(yearId),*/}
			{/*						);*/}
			{/*				});*/}
			{/*			return {*/}
			{/*				...options,*/}
			{/*			};*/}
			{/*		},*/}
			{/*	}}*/}
			{/*/>*/}
		</div>
	);
}
