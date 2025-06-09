//TODO: this is the national key indicators card replace it when migrating
import { HighlightedSingleValueConfig } from "@packages/shared/schemas";
import { Box, Group, Image } from "@mantine/core";
import NextImage from "next/image";
import { getServerImageUrl } from "@/utils/server/images";
import { HighlightedValueDisplay } from "@/components/displayItems/HighlightedSingleValueVisualizer/components/HighlightedValueDisplay";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export function HighlightedSingleValueVisualizer({
	config,
}: {
	config: HighlightedSingleValueConfig;
}) {
	const imageURL = getServerImageUrl(config.icon);

	return (
		<Box className="w-full h-full">
			<Group align="center" justify="space-between">
				<ErrorBoundary fallback={<>Error getting data</>}>
					<Suspense fallback={<div>Loading...</div>}>
						<HighlightedValueDisplay config={config} />
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
		</Box>
	);
}
