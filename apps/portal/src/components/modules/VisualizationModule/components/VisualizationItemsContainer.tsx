import { VisualizationModuleConfig } from "@packages/shared/schemas";
import { FlexibleLayoutContainer } from "@/components/FlexibleLayoutContainer";
import { FlexibleLayoutItem } from "@/components/FlexibleLayoutItem";
import { Box, Text } from "@mantine/core";
import { isEmpty } from "lodash";
import { DisplayItemContainer } from "@/components/displayItems/DisplayItemContainer";
import { DisplayItemSelector } from "@/components/displayItems/DisplayItemSelector";

export function VisualizationItemsContainer({
	config,
	searchParams,
}: {
	config: VisualizationModuleConfig;
	searchParams: { group?: string };
}) {
	if (!config.grouped) {
		if (isEmpty(config.items)) {
			return (
				<Box className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
					<Text size="lg" c="dimmed">
						There are no items configured for this module
					</Text>
				</Box>
			);
		}

		return (
			<FlexibleLayoutContainer layouts={config.layouts}>
				{config.items.map((item) => (
					<FlexibleLayoutItem
						id={item.item.id}
						key={`${item.item.id}`}
					>
						<DisplayItemContainer item={item}>
							<DisplayItemSelector item={item} />
						</DisplayItemContainer>
					</FlexibleLayoutItem>
				))}
			</FlexibleLayoutContainer>
		);
	}

	const groupId = searchParams.group;

	if (isEmpty(config.groups) && config.grouped) {
		return (
			<Box className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
				<Text size="lg" c="dimmed">
					There no groups configured for this module
				</Text>
			</Box>
		);
	}

	if (!groupId) {
		return (
			<Box className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
				<Text size="lg" c="dimmed">
					Select a group to visualize it&#39;s data
				</Text>
			</Box>
		);
	}

	const group = config.groups.find((group) => group.id === groupId);

	if (!group) {
		return (
			<Box className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
				<Text size="lg" c="dimmed">
					Could not get data for the group {groupId}
				</Text>
			</Box>
		);
	}

	if (isEmpty(group.items)) {
		return (
			<Box className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
				<Text size="lg" c="dimmed">
					There are no items configured for this group
				</Text>
			</Box>
		);
	}

	return (
		<FlexibleLayoutContainer layouts={group.layouts}>
			{group.items.map((item) => (
				<FlexibleLayoutItem id={item.item.id} key={`${item.item.id}`}>
					<DisplayItemContainer item={item}>
						<DisplayItemSelector item={item} />
					</DisplayItemContainer>
				</FlexibleLayoutItem>
			))}
		</FlexibleLayoutContainer>
	);
}
