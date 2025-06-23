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
	showFilter?: boolean;
	disableActions?: boolean;
}

export async function MainVisualization({
	showFilter,
	config,
	disableActions,
}: MainVisualizationProps) {
	const { type } = config;

	switch (type) {
		case VisualizationDisplayItemType.CHART:
			return (
				<DataVisualization
					showFilter={showFilter}
					disableActions={disableActions}
					config={config}
				/>
			);
		case VisualizationDisplayItemType.MAP:
			return (
				<MapVisualization
					showFilter={showFilter}
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
