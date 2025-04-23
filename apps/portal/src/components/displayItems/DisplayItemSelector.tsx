import { DisplayItem, DisplayItemType } from "@packages/shared/schemas";
import { MainVisualization } from "@/components/displayItems/visualizations/MainVisualization";
import { SingleValueVisualizer } from "@/components/displayItems/SingleValueVisualizer/SingleValueVisualizer";
import { RichContent } from "@/components/RichContent";

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
			return (
				<div className="flex flex-col gap-4 w-full h-full">
					<div className="flex-1">
						<RichContent content={item.item.content} />
					</div>
				</div>
			);
		default:
			return <div>Display Type not supported yet</div>;
	}
}
