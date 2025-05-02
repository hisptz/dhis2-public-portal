"use client";

import { Menu, Tabs, useMantineTheme } from "@mantine/core";
import { GroupMenuItem } from "@packages/shared/schemas";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function GroupTab({ config }: { config: GroupMenuItem }) {
	const [opened, setOpened] = useState<boolean>(false);
	const pathname = usePathname();

	const selected = config.items.reduce((acc, item) => {
		return acc || pathname.replace("/modules/", "") === item.path;
	}, false);

	const theme = useMantineTheme();

	return (
		<Menu
			trigger="click-hover"
			opened={opened}
			onChange={setOpened}
			shadow="sm"
			width={160}
			withArrow
		>
			<Menu.Target>
				{selected ? (
					<Tabs.Tab
						data-active
						aria-selected
						value={"#"}
						rightSection={
							opened ? (
								<IconChevronUp size={12} />
							) : (
								<IconChevronDown size={12} />
							)
						}
					>
						{config.label}
					</Tabs.Tab>
				) : (
					<Tabs.Tab
						value={"#"}
						rightSection={
							opened ? (
								<IconChevronUp size={12} />
							) : (
								<IconChevronDown size={12} />
							)
						}
					>
						{config.label}
					</Tabs.Tab>
				)}
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>{config.label}</Menu.Label>
				{config.items.map((item) => (
					<Menu.Item
						href={`/modules/${item.path}`}
						component={Link}
						key={item.path}
						color={
							item.path === pathname.replace("/", "")
								? theme.primaryColor
								: undefined
						}
					>
						{item.label}
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);
}
