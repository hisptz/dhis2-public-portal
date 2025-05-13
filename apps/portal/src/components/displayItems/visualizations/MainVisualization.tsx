import { DataVisualization } from "@/components/displayItems/visualizations/DataVisualization";
import { MapVisualization } from "@/components/displayItems/visualizations/MapVisualization";
import {
	VisualizationDisplayItemType,
	VisualizationItem,
} from "@packages/shared/schemas";
import { BannerVisualization } from "@/components/displayItems/visualizations/BannerVisualization";
import { BaseCardError } from "@/components/CardError";

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
		case VisualizationDisplayItemType.CHART:
			return (
				<DataVisualization
					disableActions={disableActions}
					config={config}
				/>
			);
		case VisualizationDisplayItemType.MAP:
			return (
				<MapVisualization
					disableActions={disableActions}
					config={config}
				/>
			);
		case VisualizationDisplayItemType.BANNER:
			return (
				<BannerVisualization
					config={config}
					disableActions={disableActions}
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
