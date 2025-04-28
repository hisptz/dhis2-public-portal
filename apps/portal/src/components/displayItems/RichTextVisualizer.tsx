import { RichTextItemConfig } from "@packages/shared/schemas";
import { Container } from "@mantine/core";
import { RichContent } from "@/components/RichContent";

export function RichTextVisualizer({ item }: { item: RichTextItemConfig }) {
	return (
		<Container p={0} fluid>
			<RichContent content={item.content} />
		</Container>
	);
}
