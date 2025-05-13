import { StaticModuleConfig } from "@packages/shared/schemas";
import { Stack, Title } from "@mantine/core";
import { StaticItemsList } from "@/components/modules/StaticModule/components/StaticItemsList";

export function StaticModule({
	config,
	moduleId,
}: {
	config: StaticModuleConfig;
	moduleId: string;
}) {
	return (
		<Stack>
			<Title order={2}>{config.title}</Title>
			<StaticItemsList moduleId={moduleId} config={config} />
		</Stack>
	);
}
