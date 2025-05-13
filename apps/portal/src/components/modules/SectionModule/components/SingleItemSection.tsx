import { SingleItemSectionConfig } from "@packages/shared/schemas";
import { Group } from "@mantine/core";
import { DisplayItemContainer } from "@/components/displayItems/DisplayItemContainer";
import { DisplayItemSelector } from "@/components/displayItems/DisplayItemSelector";

export function SingleItemSection({
	config,
}: {
	config: SingleItemSectionConfig;
}) {
	return (
		<Group grow>
			<DisplayItemContainer item={config.item}>
				<DisplayItemSelector item={config.item} />
			</DisplayItemContainer>
		</Group>
	);
}
