import { FileVisualizer } from "@/components/displayItems/visualizations/FileVisualizer";
import { DataVisualization } from "@/components/displayItems/visualizations/DataVisualization";
import { MapVisualization } from "@/components/displayItems/visualizations/MapVisualization";
import {
	VisualizationItem,
	LibraryFileData,
	VisualizationType,
} from "@packages/shared/schemas";
import { BannerVisualization } from "@/components/displayItems/visualizations/BannerVisualization";

export interface MainVisualizationProps {
	config: VisualizationItem;
	disableActions?: boolean;
}

export async function MainVisualization({
	config,
	disableActions,
}: MainVisualizationProps) {
	const { type } = config;
	switch (type) {
		case VisualizationType.CHART:
		case VisualizationType.PYRAMID:
			return (
				<DataVisualization
					disableActions={disableActions}
					config={config}
				/>
			);
		case VisualizationType.MAP:
			return (
				<MapVisualization
					disableActions={disableActions}
					config={config}
				/>
			);
		case VisualizationType.BANNER:
			return (
				<BannerVisualization
					config={config}
					disableActions={disableActions}
				/>
			);
		default:
			return (
				<div style={{ minHeight: "400px" }}>
					Unsupported value type {type}
				</div>
			);
	}
}
