"use client";

import { SectionModuleConfig } from "@packages/shared/schemas";
import { Flex, Stack, Title, useMantineTheme } from "@mantine/core";

export function SectionModule({ config }: { config: SectionModuleConfig }) {
	const theme = useMantineTheme();

	return (
		<div className="w-full h-full flex flex-col gap-8">
			{config.sections.map((section) => {
				return (
					<Flex gap="md" direction="column" key={section.id}>
						<Title c={theme.primaryColor} order={3}>
							{section.title}
						</Title>
						<Stack>Content will be shown here</Stack>
					</Flex>
				);
			})}
		</div>
	);
}
