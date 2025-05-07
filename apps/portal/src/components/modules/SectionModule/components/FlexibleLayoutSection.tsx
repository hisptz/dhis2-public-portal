import { FlexibleLayoutSectionConfig } from "@packages/shared/schemas";
import { FlexibleLayoutContainer } from "@/components/FlexibleLayoutContainer";
import { FlexibleLayoutItem } from "@/components/FlexibleLayoutItem";
import { DisplayItemSelector } from "@/components/displayItems/DisplayItemSelector";
import { DisplayItemContainer } from "@/components/displayItems/DisplayItemContainer";

export function FlexibleLayoutSection({
	config,
}: {
	config: FlexibleLayoutSectionConfig;
}) {
	return (
		<FlexibleLayoutContainer layouts={config.layouts}>
			{config.items.map((item) => (
				<FlexibleLayoutItem
					id={`${'item' in item ? item.item.id : item.items}`}
					key={`${'item' in item ? item.item.id : item.items}`}
				>
					<DisplayItemContainer item={item}>
						<DisplayItemSelector item={item} />
					</DisplayItemContainer>
				</FlexibleLayoutItem>
			))}
		</FlexibleLayoutContainer>
	);
}
