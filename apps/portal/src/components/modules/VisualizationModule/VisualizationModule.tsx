import { VisualizationModuleConfig } from "@packages/shared/schemas";
import { Box, Stack, Title } from "@mantine/core";
import { GroupControl } from "@/components/modules/VisualizationModule/components/GroupControl";
import { Selectors } from "@/components/modules/VisualizationModule/components/Selectors/Selectors";
import { VisualizationItemsContainer } from "@/components/modules/VisualizationModule/components/VisualizationItemsContainer";
import { ReadonlyURLSearchParams } from "next/navigation";

export function VisualizationModule({
	config,
	searchParams,
}: {
	config: VisualizationModuleConfig;
	searchParams: ReadonlyURLSearchParams;
}) {
	return (
		<Stack className="w-full h-full">
			<Title order={2}>{config.title}</Title>
			{config.grouped && <GroupControl config={config} />}
			<Selectors />
			<Box flex={1}>
				<VisualizationItemsContainer
					searchParams={searchParams}
					config={config}
				/>
			</Box>
		</Stack>
	);
}
