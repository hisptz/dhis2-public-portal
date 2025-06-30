import { VisualizationModuleConfig } from "@packages/shared/schemas";
import { Box, Stack, Title } from "@mantine/core";
import { GroupControl } from "@/components/modules/VisualizationModule/components/GroupControl";
import { Selectors } from "@/components/modules/VisualizationModule/components/Selectors/Selectors";
import { VisualizationItemsContainer } from "@/components/modules/VisualizationModule/components/VisualizationItemsContainer";
import { DescriptionArea } from "@/components/modules/VisualizationModule/components/DescriptionArea";
import { isEmpty } from "lodash";

export function VisualizationModule({
	config,
	searchParams,
	titlesColor,
}: {
	config: VisualizationModuleConfig;
	searchParams: { group?: string };
	titlesColor: string;
}) {
	return (
		<Stack className="w-full h-full">
			<Title order={2} style={{ color: titlesColor }}>
				{config.title}
			</Title>
			
			{config.grouped && !isEmpty(config.groups) && (
				<GroupControl config={config} />
			)}
			{config.showFilter ? <Selectors config={config} /> : null}
			<DescriptionArea searchParams={searchParams} config={config} />
			<Box flex={1}>
				<VisualizationItemsContainer
					searchParams={searchParams}
					config={config}
				/>
			</Box>
		</Stack>
	);
}
