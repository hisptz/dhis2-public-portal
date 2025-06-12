import { DisplayItem, DisplayItemType } from "@packages/shared/schemas";
import { MainVisualization } from "@/components/displayItems/visualizations/MainVisualization";
import { HighlightedSingleValueVisualizer } from "@/components/displayItems/HighlightedSingleValueVisualizer/HighlightedSingleValueVisualizer";
import { RichTextVisualizer } from "@/components/displayItems/RichTextVisualizer";
import FeedbackVisualizer from "./Feedback/FeedbackVisualizer";

export function DisplayItemSelector({ item, showFilter }: { item: DisplayItem, showFilter?: boolean }) {
	switch (item.type) {
		case DisplayItemType.VISUALIZATION:
			return (
				<MainVisualization
					key={`${item.item.id}-vis`}
					showFilter={showFilter}
					config={item.item}
				/>
			);
		case DisplayItemType.HIGHLIGHTED_SINGLE_VALUE:
			return <HighlightedSingleValueVisualizer config={item.item} />;
		case DisplayItemType.RICH_TEXT:
			return <RichTextVisualizer item={item.item} />;
		case DisplayItemType.FEEDBACK:
			return <FeedbackVisualizer item={item.item} />;
		default:
			return <div>Display Type not supported yet</div>;
	}
}
