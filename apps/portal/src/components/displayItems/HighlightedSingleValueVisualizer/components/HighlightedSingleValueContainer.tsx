import {
	ChartVisualizationItem,
	HighlightedSingleValueConfig,
} from "@packages/shared/schemas";
import { Box, Group, Image, Stack, Title } from "@mantine/core";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { HighlightedValueDisplay } from "@/components/displayItems/HighlightedSingleValueVisualizer/components/HighlightedValueDisplay";
import NextImage from "next/image";
import { getServerImageUrl } from "@/utils/server/images";
import { getDataVisualization } from "@/components/displayItems/visualizations/DataVisualization";

export async function HighlightedSingleValueContainer({
	config,
}: {
	config: HighlightedSingleValueConfig;
}) {
	const { visualizationConfig } = await getDataVisualization({
		id: config.id,
	} as ChartVisualizationItem);

	const imageURL = getServerImageUrl(config.icon);

	return (
		<Stack w="100%" align="start" gap="sm">
			<Title order={5}>{visualizationConfig.name}</Title>
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
