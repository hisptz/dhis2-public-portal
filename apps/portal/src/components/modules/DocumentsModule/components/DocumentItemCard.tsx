import { DocumentItem } from "@packages/shared/schemas";
import { AspectRatio, Card, Stack, Title } from "@mantine/core";

//TODO: Needs to be migrated
export function DocumentItemCard({ item }: { item: DocumentItem }) {
	return (
		<AspectRatio ratio={1}>
			<Card className="w-full h-full">
				<Stack>
					<Title order={4}>{item.label}</Title>
				</Stack>
			</Card>
		</AspectRatio>
	);
}
