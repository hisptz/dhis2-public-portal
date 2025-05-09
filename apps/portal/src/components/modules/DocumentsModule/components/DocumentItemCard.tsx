import { DocumentItem } from "@packages/shared/schemas";
import { Box, Card } from "@mantine/core";
import { FileVisualizer } from "@/components/displayItems/visualizations/FileVisualizer";

export async function DocumentItemCard({ item }: { item: DocumentItem }) {
	return (
		<Box className="w-[224px] h-[256px]">
			<Card
				className={`w-full h-full border-1 border-transparent hover:border-(--mantine-color-anchor)`}
			>
				<FileVisualizer config={item} />
			</Card>
		</Box>
	);
}
