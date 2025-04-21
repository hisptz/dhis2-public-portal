"use client";

import { Section } from "@packages/shared/schemas";
import { Title, useMantineTheme } from "@mantine/core";

export function SectionTitle({ section }: { section: Section }) {
	const theme = useMantineTheme();
	return <Title order={3}>{section.title}</Title>;
}
