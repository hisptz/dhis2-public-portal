import { StaticModuleConfig } from "@packages/shared/schemas";
import { Stack, Title } from "@mantine/core";
import { StaticItemsList } from "@/components/modules/StaticModule/components/StaticItemsList";

export function StaticModule({
	config,
	moduleId,
	headingColor,
}: {
	config: StaticModuleConfig;
	moduleId: string;
	headingColor: string;
}) {
	return (
		<Stack>
			<Title order={2} style={{ color: headingColor }}>{config.title}</Title>
			<StaticItemsList moduleId={moduleId} config={config} />
		</Stack>
	);
}
