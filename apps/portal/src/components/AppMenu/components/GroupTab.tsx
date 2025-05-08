"use client";

import { Menu, Tabs, useMantineTheme } from "@mantine/core";
import { GroupMenuItem } from "@packages/shared/schemas";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ReactSVG } from "react-svg";
import { useGetImageUrl } from "@/utils/client/images";

export function GroupTab({
	config,
	foregroundColor,
	backgroundColor,
}: {
	config: GroupMenuItem;
	foregroundColor?: string;
	backgroundColor?: string;
}) {
	const [opened, setOpened] = useState<boolean>(false);
	const pathname = usePathname();

	const getImageUrl = useGetImageUrl();

	const selected = config.items.reduce((acc, item) => {
		return acc || pathname.replace("/modules/", "") === item.path;
	}, false);

	const theme = useMantineTheme();

	const icon = config.icon ? getImageUrl(config.icon) : undefined;

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
						style={{
							"color": foregroundColor,
							"--tab-hover-color": backgroundColor,
						}}
						color={foregroundColor}
						data-active
						aria-selected
						leftSection={
							config.icon && (
								<ReactSVG width={12} height={12} src={icon!} />
							)
						}
						value={"#"}
						rightSection={
							opened ? (
								<IconChevronUp size={12} />
							) : (
								<IconChevronDown size={12} />
							)
						}
					>
						<b>{config.label}</b>
					</Tabs.Tab>
				) : (
					<Tabs.Tab
						style={{
							"color": foregroundColor,
							"--tab-hover-color": backgroundColor,
						}}
						color={foregroundColor}
						value={"#"}
						leftSection={config.icon && <ReactSVG src={icon!} />}
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
