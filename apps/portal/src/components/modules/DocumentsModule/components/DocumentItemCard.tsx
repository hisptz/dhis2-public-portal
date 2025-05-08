import { DocumentItem } from "@packages/shared/schemas";
import { AspectRatio, Card, Stack } from "@mantine/core";
import { FileVisualizer } from "@/components/displayItems/visualizations/FileVisualizer";

export function DocumentItemCard({ item }: { item: DocumentItem }) {
	return (
		<AspectRatio ratio={1}>
			<Card className="w-full h-full">
				<Stack>
					<FileVisualizer config={item} />
				</Stack>
			</Card>
		</AspectRatio>
	);
}
