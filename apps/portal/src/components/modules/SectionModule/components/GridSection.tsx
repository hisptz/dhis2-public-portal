import { GridLayoutSectionConfig } from "@packages/shared/schemas";
import { SimpleGrid } from "@mantine/core";
import { DisplayItemContainer } from "@/components/displayItems/DisplayItemContainer";
import { DisplayItemSelector } from "@/components/displayItems/DisplayItemSelector";

export function GridSection({ config }: { config: GridLayoutSectionConfig }) {
	return (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 2, lg: 3, xl: 4 }} spacing="sm">
			{config.items.map((item) => (
				<DisplayItemContainer
					key={`${item.item.id}-container`}
					item={item}
				>
					<DisplayItemSelector item={item} />
				</DisplayItemContainer>
			))}
		</SimpleGrid>
	);
}
