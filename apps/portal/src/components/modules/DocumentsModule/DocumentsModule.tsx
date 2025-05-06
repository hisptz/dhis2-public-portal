import { Stack, Title } from "@mantine/core";
import { DocumentsItemsContainer } from "@/components/modules/DocumentsModule/components/DocumentsItemsContainer";
import { DocumentsModuleConfig } from "@packages/shared/schemas";
import { DocumentsGroupControl } from "@/components/modules/DocumentsModule/components/DocumentsGroupControl";
import { isEmpty } from "lodash";

export function DocumentsModule({
	config,
	searchParams,
}: {
	config: DocumentsModuleConfig;
	searchParams: { group?: string };
}) {
	return (
		<Stack className="w-full h-full">
			<Title order={2}>{config.title}</Title>
			{config.grouped && !isEmpty(config.groups) && (
				<DocumentsGroupControl config={config} />
			)}
			<DocumentsItemsContainer
				config={config}
				searchParams={searchParams}
			/>
		</Stack>
	);
}
