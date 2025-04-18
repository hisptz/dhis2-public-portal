"use client";
import {
	AppMenuConfig,
	AppTitleConfig,
	HeaderConfig,
} from "@packages/shared/schemas";
import {
	AppShell,
	Box,
	Burger,
	Container,
	Flex,
	Image,
	Stack,
	Title,
	useMantineTheme,
} from "@mantine/core";
import NextImage from "next/image";
import { getForeground } from "@/utils/colors";
import { HeaderMenu } from "@/components/AppMenu/HeaderMenu";

export function AppHeader({
	config,
	opened,
	toggle,
	title,
	logo,
	menuConfig,
}: {
	config: HeaderConfig;
	menuConfig: AppMenuConfig;
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
		<AppShell.Header p={0} bg={backgroundColor} color="cyan">
			<Stack gap={0}>
				<Flex gap="lg" align="center" p="sm">
					<Burger
						opened={opened}
						onClick={toggle}
						hiddenFrom="sm"
						size="sm"
					/>
					<Box className="min-w-[100px]">
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
					</Box>
					<Stack
						align={
							config.title.style?.center ? "center" : "flex-start"
						}
						flex={1}
						gap="xs"
						py={0}
						my={0}
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
						<Container className="min-w-full">
							{menuConfig.position === "header" && (
								<HeaderMenu config={menuConfig} />
							)}
						</Container>
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
			</Stack>
		</AppShell.Header>
	);
}
