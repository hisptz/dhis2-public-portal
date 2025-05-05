import { SectionDisplay, SectionModuleConfig } from "@packages/shared/schemas";
import { SimpleGrid, Stack } from "@mantine/core";
import { SectionTitle } from "@/components/modules/SectionModule/components/SectionTitle";
import { SectionDisplaySelector } from "@/components/modules/SectionModule/components/SectionDisplaySelector";

export function SectionModule({ config }: { config: SectionModuleConfig }) {
	const isHorizontal = config.sectionDisplay === SectionDisplay.HORIZONTAL;
	const sections = config.config.sections.map((section) => (
		<Stack gap="md" key={section.id}>
			<SectionTitle section={section} />
			<SectionDisplaySelector section={section} />
		</Stack>
	));

	return (
		<Stack gap="md">
			{isHorizontal ? (
				<SimpleGrid
					cols={{ base: 2 }}
					spacing="md"
					verticalSpacing="md"
				>
					{sections}
				</SimpleGrid>
			) : (
				<Stack gap="md">{sections}</Stack>
			)}
		</Stack>
	);
}
