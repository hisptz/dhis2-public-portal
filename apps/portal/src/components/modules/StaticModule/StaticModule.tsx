import { StaticModuleConfig } from "@packages/shared/schemas";
import { Stack, Title } from "@mantine/core";
import { StaticItemsList } from "@/components/modules/StaticModule/components/StaticItemsList";

export function StaticModule({
	config,
	moduleId,
	titlesColor,
}: {
	config: StaticModuleConfig;
	moduleId: string;
	titlesColor: string;
}) {
	return (
		<Stack>
			<Title order={2} style={{ color: titlesColor }}>{config.title}</Title>
			<StaticItemsList moduleId={moduleId} config={config} />
		</Stack>
	);
}
