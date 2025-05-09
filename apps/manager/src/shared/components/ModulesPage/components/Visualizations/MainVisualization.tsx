import {
	VisualizationDisplayItemType,
	VisualizationItem,
} from "@packages/shared/schemas";
import React, { memo } from "react";
import { DataVisualization } from "./components/DataVisualization";
import { MapVisualization } from "./components/MapVisualization";
import { BannerVisualization } from "./components/BannerVisualization";
import ErrorPage from "../../../ErrorPage/ErrorPage";

export interface MainVisualizationProps {
	config: VisualizationItem;
}

export const MainVisualization = memo(function MainVisualization({
	config,
}: MainVisualizationProps) {
	const { type } = config;

	switch (type) {
		case VisualizationDisplayItemType.CHART:
			return <DataVisualization config={config} />;
		case VisualizationDisplayItemType.MAP:
			return <MapVisualization config={config} />;
		case VisualizationDisplayItemType.BANNER:
			return <BannerVisualization config={config} />;
		default:
			return (
				<ErrorPage error={new Error("Unsupported visualization ")} />
			);
	}
});
