import { SingleItemSectionConfig } from "@packages/shared/schemas";
import { Container } from "@mantine/core";
import { DisplayItemContainer } from "@/components/displayItems/DisplayItemContainer";
import { DisplayItemSelector } from "@/components/displayItems/DisplayItemSelector";

export function SingleItemSection({
	config,
}: {
	config: SingleItemSectionConfig;
}) {
	console.log(config);
	return (
		<Container fluid>
			<DisplayItemContainer item={config.item}>
				<DisplayItemSelector item={config.item} />
			</DisplayItemContainer>
		</Container>
	);
}
