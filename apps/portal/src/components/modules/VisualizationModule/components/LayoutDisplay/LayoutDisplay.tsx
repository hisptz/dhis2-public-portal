import { DisplayItem, FlexibleLayoutConfig } from "@packages/shared/schemas";
import { FlexibleLayoutContainer } from "@/components/FlexibleLayoutContainer";
import { FlexibleLayoutItem } from "@/components/FlexibleLayoutItem";

export function LayoutDisplay({
	items,
	layouts,
}: {
	items: DisplayItem[];
	layouts: FlexibleLayoutConfig;
}) {
	return (
		<FlexibleLayoutContainer layouts={layouts}>
			{items.map((item) => (
				<FlexibleLayoutItem key={`${item.item.id}-flexible-container`}>
					{item.type}
				</FlexibleLayoutItem>
			))}
		</FlexibleLayoutContainer>
	);
}
