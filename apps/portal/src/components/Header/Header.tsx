"use client";
import { AppTitleConfig, HeaderConfig } from "@packages/shared/schemas";
import {
	AppShell,
	Burger,
	Flex,
	Image,
	Stack,
	Title,
	useMantineTheme,
} from "@mantine/core";
import NextImage from "next/image";
import { getForeground } from "@/utils/colors";

export function AppHeader({
	config,
	opened,
	toggle,
	title,
	logo,
}: {
	config: HeaderConfig;
	title: AppTitleConfig;
	logo: string;
	opened: boolean;
	toggle: () => void;
}) {
	const theme = useMantineTheme();
	const backgroundColor = config.style?.coloredBackground
		? theme.primaryColor
		: undefined;
	const foregroundColor = backgroundColor
		? getForeground(backgroundColor)
		: undefined;
	return (
		<AppShell.Header bg={backgroundColor} color="cyan">
			<Flex gap="lg" align="center" p="sm">
				<Burger
					opened={opened}
					onClick={toggle}
					hiddenFrom="sm"
					size="sm"
				/>
				{config.logo.enabled && (
					<Image
						component={NextImage}
						width={60}
						height={60}
						alt="logo"
						src={logo}
						visibleFrom="sm"
						fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
					/>
				)}
				<Stack
					align={config.title.style?.center ? "center" : "flex-start"}
					flex={1}
					gap="xs"
				>
					<Title
						bg={
							config.style?.coloredBackground
								? theme.primaryColor
								: undefined
						}
						c={foregroundColor}
						order={2}
					>
						{title.main}
					</Title>
					{title.subtitle && (
						<Title c={foregroundColor} order={4}>
							{title.subtitle}
						</Title>
					)}
				</Stack>
				{config.trailingLogo && (
					<Image
						component={NextImage}
						width={60}
						height={60}
						alt="logo"
						src={config.trailingLogo}
						hiddenFrom="!xs"
						fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
					/>
				)}
			</Flex>
		</AppShell.Header>
	);
}
