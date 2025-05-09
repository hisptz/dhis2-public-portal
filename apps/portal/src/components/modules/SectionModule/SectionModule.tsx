import { SectionDisplay, SectionModuleConfig } from "@packages/shared/schemas";
import { Box, SimpleGrid, Stack, Text } from "@mantine/core";
import { SectionTitle } from "@/components/modules/SectionModule/components/SectionTitle";
import { SectionDisplaySelector } from "@/components/modules/SectionModule/components/SectionDisplaySelector";
import { isEmpty } from "lodash";

export function SectionModule({ config }: { config: SectionModuleConfig }) {
	const isHorizontal = config.sectionDisplay === SectionDisplay.HORIZONTAL;
	const sections = config.config?.sections.map((section) => (
		<Stack gap="md" key={section.id}>
			<SectionTitle section={section} />
			<SectionDisplaySelector section={section} />
		</Stack>
	));

	if (isEmpty(sections)) {
		return (
			<Box className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
				<Text size="lg" c="dimmed">
					There no sections configured for this module
				</Text>
			</Box>
		);
	}

	return (
		<Stack gap="md">
			{isHorizontal ? (
				<SimpleGrid
					cols={{ sm: 1, md: 2, lg: 2 }}
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
