"use client";

import { DisplayItem } from "@packages/shared/schemas";
import { ActionIcon, Card, Group, Menu, Text } from "@mantine/core";
import { IconDots, IconScreenShare } from "@tabler/icons-react";

export function DisplayItemContainer({ item }: { item: DisplayItem }) {
	return (
		<Card className="w-full h-full">
			<Group justify="space-between">
				<Text fw={500}>{item.item.id}</Text>
				<Menu withinPortal position="bottom-end" shadow="sm">
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray">
							<IconDots size={16} />
						</ActionIcon>
					</Menu.Target>

					<Menu.Dropdown>
						<Menu.Item leftSection={<IconScreenShare size={14} />}>
							Fullscreen
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</Card>
	);
}
