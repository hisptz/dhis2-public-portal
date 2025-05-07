"use client";

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
}: {
	analytics: AnalyticsData;
	visualization: VisualizationConfig;
	colors: string[];
	background?: boolean;
}) {
	const legendSet = head(visualization.columns[0]!.items)?.legendSet;
	const ref = useRef<HTMLDivElement | null>(null);
	const { width } = useResizeObserver({
		ref: ref as RefObject<HTMLDivElement>,
	});
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
		const textLength = value.toString().length;
		const size = Math.ceil((width ?? 100) / textLength) + 12;
		return clamp(size, 14, 120);
	}, [width, value]);

	return (
		<div className="w-full h-full flex flex-col align-center justify-center gap-2">
			<span
				style={{ fontSize: 16 }}
				className="text-background-500 text-center"
			>
				{truncate(labels.join(" - "), {
					length: 50,
					omission: "...",
				})}
			</span>
			{isNaN(value) ? (
				<span
					style={{
						background: backgroundColor,
						height: "80%",
						borderRadius: 10,
						color,
						padding: 16,
						fontSize,
					}}
					className="flex-1 flex flex-col font-bold text-center justify-center align-middle"
				>
					{i18n.t("No data")}
				</span>
			) : (
				<span
					ref={ref}
					style={{
						background: backgroundColor,
						height: "80%",
						borderRadius: 10,
						color,
						padding: 16,
						fontSize,
					}}
					className="flex-1 flex flex-col font-bold text-center justify-center align-middle"
				>
					{numberFormatter(value)}
				</span>
			)}
		</div>
	);
}
