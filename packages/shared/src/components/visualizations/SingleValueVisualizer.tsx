import React, { RefObject, useMemo, useRef } from "react";
import { clamp, flatten, get, head, truncate } from "lodash";
import { useResizeObserver } from "usehooks-ts";
import i18n from "@dhis2/d2-i18n";
import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import {
	getForeground,
	getLegendColorFromValue,
	numberFormatter,
} from "@packages/shared/utils";

export function SingleValueVisualizer({
	analytics,
	visualization,
	colors,
	background,
	containerRef,
}: {
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	colors: string[];
	background?: boolean;
	containerRef?: RefObject<HTMLDivElement | null>;
}) {
	const legendSet = visualization.dataDimensionItems[0]?.indicator?.legendSet;
	const ref = useRef<HTMLDivElement | null>(null);
	const { height } = useResizeObserver({
		ref: (containerRef ?? ref) as RefObject<HTMLDivElement>,
	});
	const { rows, headers, metaData } = analytics;	
	const valueHeaderIndex = headers.findIndex(({ name }) => name === "value");
	const dataHeaderIndex = headers.findIndex(({ name }) => name === "dx");
	const value = parseFloat(get(head(rows), [valueHeaderIndex]) ?? "");
	const dataItemId = get(head(rows), [dataHeaderIndex]);
	
 	const dataItem = dataItemId ? metaData?.items[dataItemId] : null;
	const isPercentage = dataItem?.indicatorType?.factor === 100;

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

	const { backgroundColor, color } = useMemo(() => {
		if (background) {
			if (legendColor) {
				return {
					backgroundColor: legendColor,
					color: getForeground(legendColor),
				};
			}
			return {
				backgroundColor: colors[0],
				color: getForeground(colors[0]!),
			};
		}

		if (legendColor) {
			const legendConfig = visualization.legend;
			if (legendConfig?.style === "TEXT") {
				return {
					backgroundColor: "#FFFFFF",
					color: legendColor,
				};
			}
			return {
				backgroundColor: legendColor,
				color: getForeground(legendColor),
			};
		}

		return {
			backgroundColor: "#FFFFFF",
			color: colors[1],
		};
	}, [background, colors, legendColor, visualization.legend]);

	const fontSize = useMemo(() => {
 		const availableHeight = (height ?? 100) * 0.6;  
 		const size = Math.ceil(availableHeight * 0.3);  
		return clamp(size, 14, 80);  
	}, [height]);

	return (
		<div className="w-full h-full flex flex-col align-center justify-center gap-2">
			{!visualization.hideSubtitle && (
				<span
					style={{ fontSize: 16 }}
					className="text-background-500 text-center min-h-[2.5rem] leading-tight line-clamp-2 flex items-start"
				>
					{truncate(labels.join(" - "), {
						length: 50,
						omission: "...",
					})}
				</span>
			)}
			{isNaN(value) ? (
				<span
					style={{
						background: backgroundColor,
						minHeight: "80%",
						borderRadius: 10,
						color,
						padding: 16,
						fontSize,
					}}
					className="flex-1 flex flex-col font-bold text-center justify-center align-middle overflow-hidden"
				>
					{i18n.t("No data")}
				</span>
			) : (
				<span
					ref={ref}
					style={{
						background: backgroundColor,
						minHeight: "80%",
						borderRadius: 10,
						color,
						padding: 16,
						fontSize,
					}}
					className="flex-1 flex flex-col font-bold text-center justify-center align-middle overflow-hidden break-words"
				>
					{isPercentage ? `${numberFormatter(value)}%` : numberFormatter(value)}
				</span>
			)}
		</div>
	);
}
