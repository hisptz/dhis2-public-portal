//TODO: this is the national key indicators card replace it when migrating
import { HighlightedSingleValueConfig } from "@packages/shared/schemas";
import { Box, Center, Loader } from "@mantine/core";
import { getServerImageUrl } from "@/utils/server/images";
import { HighlightedSingleValueContainer } from "@/components/displayItems/HighlightedSingleValueVisualizer/components/HighlightedSingleValueContainer";
import { Suspense } from "react";

export function HighlightedSingleValueVisualizer({
	config,
}: {
	config: HighlightedSingleValueConfig;
}) {
	const imageURL = getServerImageUrl(config.icon);

	return (
		<Box className="w-full h-full">
			<Suspense
				fallback={
					<Center>
						<Loader size="sm" />
					</Center>
				}
			>
				<HighlightedSingleValueContainer config={config} />
			</Suspense>
		</Box>
	);
}
