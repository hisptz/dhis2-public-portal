import {
	ChartVisualizationItem,
	DefaultAnalyticsDimension,
	HighlightedSingleValueConfig
} from "@packages/shared/schemas";
import { Box, Group, Image, Stack, Title } from "@mantine/core";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import {
	HighlightedValueDisplay
} from "@/components/displayItems/HighlightedSingleValueVisualizer/components/HighlightedValueDisplay";
import NextImage from "next/image";
import { getServerImageUrl } from "@/utils/server/images";
import { getDataVisualization } from "@/components/displayItems/visualizations/DataVisualization";
import { find } from "lodash";
import { PeriodUtility } from "@hisptz/dhis2-utils";

export async function HighlightedSingleValueContainer({
	config,
}: {
	config: HighlightedSingleValueConfig;
}) {
	const { visualizationConfig } = await getDataVisualization({
		id: config.id,
	} as ChartVisualizationItem);

	const imageURL = getServerImageUrl(config.icon);
	const periods =
		find(visualizationConfig.filters, {
			dimension: DefaultAnalyticsDimension.pe,
		})?.items?.map((item) => PeriodUtility.getPeriodById(item.id).name) ??
		[];

	return (
		<Stack w="100%" align="start" gap="sm">
			<div>
				<Title order={5}>{visualizationConfig.name}</Title>
				<Title order={6} c={"gray"} pt={"xs"}>
					{periods.join(", ")}
				</Title>
			</div>
			<Group w="100%" align="center" justify="space-between">
				<ErrorBoundary fallback={<>Error getting data</>}>
					<Suspense fallback={<div>Loading...</div>}>
						<HighlightedValueDisplay
							visualizationConfig={visualizationConfig}
						/>
					</Suspense>
				</ErrorBoundary>
				<Box className="w-[80px] h-[80px] items-center justify-center flex">
					<Image
						alt={config.icon}
						width={80}
						height={80}
						component={NextImage}
						src={imageURL}
					/>
				</Box>
			</Group>
		</Stack>
	);
}
