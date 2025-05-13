import { RichTextItemConfig } from "@packages/shared/schemas";
import { RichContent } from "@/components/RichContent";

export function RichTextVisualizer({ item }: { item: RichTextItemConfig }) {
	return <RichContent content={item.content} />;
}
