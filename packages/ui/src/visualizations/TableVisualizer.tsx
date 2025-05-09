import React, { RefObject } from "react";

import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import { isEmpty } from "lodash";
import { DHIS2PivotTable } from "@hisptz/dhis2-analytics";

export interface TableVisualizerProps {
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
}: TableVisualizerProps) {
	return (
		<DHIS2PivotTable
			/*
	 // @ts-expect-error library fix */
			setRef={setRef}
			tableProps={{
				scrollHeight: fullScreen
					? `calc(100dvh - 96px)`
					: `calc(100% - 48px)`,
			}}
			analytics={analytics}
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
