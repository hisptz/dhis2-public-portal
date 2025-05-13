import { DisplayItem, DisplayItemType } from "@packages/shared/schemas";
import { MainVisualization } from "@/components/displayItems/visualizations/MainVisualization";
import { SingleValueVisualizer } from "@/components/displayItems/SingleValueVisualizer/SingleValueVisualizer";
import { RichTextVisualizer } from "@/components/displayItems/RichTextVisualizer";

export function DisplayItemSelector({ item }: { item: DisplayItem }) {
	switch (item.type) {
		case DisplayItemType.VISUALIZATION:
			return (
				<MainVisualization
					key={`${item.item.id}-vis`}
					config={item.item}
				/>
			);
		case DisplayItemType.SINGLE_VALUE:
			return <SingleValueVisualizer config={item.item} />;
		case DisplayItemType.RICH_TEXT:
			return <RichTextVisualizer item={item.item} />;
		default:
			return <div>Display Type not supported yet</div>;
	}
}
