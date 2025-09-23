import {
	VisualizationItem,
	YearOverYearVisualizationConfig,
} from "@packages/shared/schemas";

import React from "react";
import { useYearOverYearAnalytics } from "@packages/shared/hooks";
import {
	VisualizationTitle,
	YearOverYearVisualizer,
} from "@packages/shared/visualizations";
import { FullLoader } from "../../../../../FullLoader";

export function YearOverYearDataVisComponent({
	visualizationConfig,
	config,
	disableActions,
	colors,
}: {
	visualizationConfig: YearOverYearVisualizationConfig;
	config: VisualizationItem;
	colors: string[];
	disableActions?: boolean;
}) {
	const { loading, analytics } = useYearOverYearAnalytics({
		visualizationConfig,
	});

	return (
		<>
			<div
				key={visualizationConfig.name}
				className="flex flex-col gap-2 w-full h-full"
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
						<YearOverYearVisualizer
							analytics={analytics}
							visualization={visualizationConfig}
							colors={colors}
							setRef={{ current: null }}
						/>
					</div>
				) : (
					<div />
				)}
			</div>
		</>
	);
}
