import { DocumentsModuleConfig } from "@packages/shared/schemas";
import { Box, Group, Text } from "@mantine/core";
import { isEmpty } from "lodash";
import { DocumentItemCard } from "@/components/modules/DocumentsModule/components/DocumentItemCard";

export function DocumentsItemsContainer({
	config,
	searchParams,
}: {
	config: DocumentsModuleConfig;
	searchParams: { group?: string };
}) {
	if (!config.grouped) {
		if (isEmpty(config.items)) {
			return (
				<Box
					flex={1}
					className="w-full h-full flex flex-col items-center justify-center min-h-[400px]"
				>
					<Text size="lg" c="dimmed">
						There are no items configured for this module
					</Text>
				</Box>
			);
		}

		return (
			<Group wrap="wrap" flex={1}>
				{config.items.map((item) => (
					<DocumentItemCard key={item.id} item={item} />
				))}
			</Group>
		);
	}

	if (isEmpty(config.groups) && config.grouped) {
		return (
			<Box className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
				<Text size="lg" c="dimmed">
					There are no groups configured for this module
				</Text>
			</Box>
		);
	}

	const groupId = searchParams.group;

	if (!groupId) {
		return (
			<Box
				flex={1}
				className="w-full h-full flex flex-col items-center justify-center min-h-[400px]"
			>
				<Text size="lg" c="dimmed">
					Select a group to show documents from
				</Text>
			</Box>
		);
	}

	const group = config.groups.find((group) => group.id === groupId);

	if (!group) {
		return (
			<Box
				flex={1}
				className="w-full h-full flex flex-col items-center justify-center min-h-[400px]"
			>
				<Text size="lg" c="dimmed">
					Could not get data for the group {groupId}
				</Text>
			</Box>
		);
	}

	if (isEmpty(group.items)) {
		return (
			<Box
				flex={1}
				className="w-full h-full flex flex-col items-center justify-center min-h-[400px]"
			>
				<Text size="lg" c="dimmed">
					There are no items configured for this group
				</Text>
			</Box>
		);
	}

	return (
		<Group wrap="wrap" flex={1}>
			{group.items.map((item) => (
				<DocumentItemCard key={item.id} item={item} />
			))}
		</Group>
	);
}
