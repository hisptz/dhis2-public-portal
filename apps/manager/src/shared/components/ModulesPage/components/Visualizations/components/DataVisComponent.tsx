import {
	VisualizationConfig,
	VisualizationDisplayItemType,
	VisualizationItem,
} from "@packages/shared/schemas";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useAnalytics } from "@packages/shared/hooks";
import React from "react";
import { FullLoader } from "../../../../FullLoader";
import { ChartSelector, VisualizationTitle } from "@packages/ui/visualizations";

export function DataVisComponent({
	visualizationConfig,
	config,
	colors,
}: {
	visualizationConfig: VisualizationConfig;
	config: VisualizationItem;
	colors: string[];
}) {
	const { type } = config;
	const handler = useFullScreenHandle();
	const { analytics, loading: analyticsLoading } = useAnalytics({
		visualizationConfig,
	});

	return (
		<>
			<FullScreen className="bg-white w-full h-full" handle={handler}>
				<div
					key={visualizationConfig.name}
					className="flex flex-col gap-2 w-full h-full"
				>
					<div className="flex flex-row place-content-between">
						<VisualizationTitle title={visualizationConfig.name} />
					</div>
					{analyticsLoading ? (
						<div className="flex justify-center items-center h-full">
							<FullLoader />{" "}
						</div>
					) : analytics ? (
						<div className="flex-1 h-full">
							{type === VisualizationDisplayItemType.CHART && (
								<ChartSelector
									colors={colors}
									analytics={analytics}
									visualization={visualizationConfig}
									fullScreen={handler.active}
									tableRef={{ current: null }}
									setRef={{ current: null }}
								/>
							)}
						</div>
					) : (
						<div />
					)}
				</div>
			</FullScreen>
		</>
	);
}
