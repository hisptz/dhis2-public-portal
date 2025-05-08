import {
	VisualizationConfig,
	VisualizationDisplayItemType,
	VisualizationItem,
} from "@packages/shared/schemas";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { VisualizationTitle } from "@packages/ui/visualizations";
import {
	useContainerSize,
	useVisualizationLegendSet,
	useVisualizationRefs,
} from "@packages/shared/hooks";
import { ChartSelector } from "@packages/ui/visualizations";
import { useAnalytics } from "@packages/shared/hooks";
import React from "react";
import { FullLoader } from "../../../../FullLoader";

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
	const { chartRef, tableRef, setSingleValueRef } = useVisualizationRefs();
	const { containerRef } = useContainerSize(chartRef);
    const handler = useFullScreenHandle();
	const {
		analytics,
		loading: analyticsLoading,
	} = useAnalytics({ visualizationConfig });

	const { loading: legendSetLoading, legendSet } =
		useVisualizationLegendSet(visualizationConfig);

	const loading = analyticsLoading || legendSetLoading;


	return (
		<>
			<FullScreen className="bg-white w-full h-full" handle={handler}>
				<div
					key={visualizationConfig.name}
					className="flex flex-col gap-2 w-full h-full"
					ref={containerRef}
				>
					<div className="flex flex-row place-content-between">
						<VisualizationTitle title={visualizationConfig.name} />
					
					</div>
					{loading ? (
						<div className="flex justify-center items-center h-full">
							<FullLoader />{" "}
						</div>
					) : analytics ? (
							<div className="flex-1 h-full">
								{type ===
									VisualizationDisplayItemType.CHART && (
									<ChartSelector
										colors={colors}
										setRef={chartRef}
										analytics={analytics}
										visualization={visualizationConfig}
										config={config}
										fullScreen={handler.active}
										containerRef={containerRef}
										legendSet={legendSet}
										tableRef={tableRef}
										setSingleValueRef={setSingleValueRef}
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
