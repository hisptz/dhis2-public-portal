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
					id={`${item.item.id}`}
					key={`${item.item.id}`}
				>
					<DisplayItemContainer item={item}>
						<DisplayItemSelector item={item} />
					</DisplayItemContainer>
				</FlexibleLayoutItem>
			))}
		</FlexibleLayoutContainer>
	);
}
