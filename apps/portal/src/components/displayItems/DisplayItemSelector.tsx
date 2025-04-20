import { DisplayItem, DisplayItemType } from "@packages/shared/schemas";
import { MainVisualization } from "@/components/displayItems/visualizations/MainVisualization";

export function DisplayItemSelector({ item }: { item: DisplayItem }) {
	switch (item.type) {
		case DisplayItemType.VISUALIZATION:
			return (
				<MainVisualization
					key={`${item.item.id}-vis`}
					config={item.item}
				/>
			);
		default:
			return <div>{item.type} not supported yet</div>;
	}
}
