import React, { RefObject, useMemo } from "react";

import { AnalyticsData, VisualizationConfig } from "../../schemas";
import { isArray, isEmpty } from "lodash";
import { DHIS2PivotTable } from "@hisptz/dhis2-analytics";
import { getVisualizationLegendSet } from "../../utils";
import { LegendSet } from "@hisptz/dhis2-utils";

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
	const legend = useMemo(() => {
		if (!visualization.legend) {
			return;
		}
		if (visualization.legend.strategy === "FIXED") {
			if (!visualization.legend.set) {
				return;
			}
			return {
				...visualization.legend,
			};
		}

		if (visualization.legend.strategy === "BY_DATA_ITEM") {
			const legendSets = getVisualizationLegendSet(visualization);
			if (isArray(legendSets)) {
				const legendMap = new Map<string, LegendSet>(
					legendSets.map(({ dataItem, legendSet }) => [
						dataItem,
						legendSet,
					]),
				);
				return {
					...visualization.legend,
					legendMap,
				};
			}
		}
	}, [visualization.legend]);

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
					// @ts-ignore
					legend: legend,
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
