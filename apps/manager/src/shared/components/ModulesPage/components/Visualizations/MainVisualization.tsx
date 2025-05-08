import {
	VisualizationDisplayItemType,
	VisualizationItem,
} from "@packages/shared/schemas";
 import React from "react";
import { DataVisualization } from "./components/DataVisualization";
import { MapVisualization } from "./components/MapVisualization";
import { BannerVisualization } from "./components/BannerVisualization";
import { BaseCardError } from "@packages/shared/components";

export interface MainVisualizationProps {
	config: VisualizationItem;
}

export function MainVisualization({
	config,
}: MainVisualizationProps) {
	const { type } = config;

	switch (type) {
		case VisualizationDisplayItemType.CHART:
			return (
				<DataVisualization
					config={config}
				/>
			);
		case VisualizationDisplayItemType.MAP:
			return (
				<MapVisualization
					config={config}
				/>
			);
		case VisualizationDisplayItemType.BANNER:
			return (
				<BannerVisualization
					config={config}
				/>
			);
		default:
			return (
				<BaseCardError
					error={new Error("Unsupported visualization ")}
				/>
			);
	}
}
