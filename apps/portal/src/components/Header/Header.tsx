"use client";
import {
	AppMenuConfig,
	AppTitleConfig,
	HeaderConfig,
} from "@packages/shared/schemas";
import {
	AppShell,
	AspectRatio,
	Burger,
	Container,
	Flex,
	Image,
	Stack,
	Title,
	useMantineTheme,
} from "@mantine/core";
import NextImage from "next/image";
import { getForeground } from "@packages/shared/utils";
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
			<Flex gap="lg" align="center" p={0}>
				<Burger
					opened={opened}
					onClick={toggle}
					hiddenFrom="sm"
					size="sm"
				/>
				<AspectRatio ratio={1} p="sm" flex="0 0 120px">
					{config.logo.enabled && (
						<Image
							component={NextImage}
							width={120}
							height={120}
							alt="logo"
							src={logo}
							visibleFrom="sm"
							fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
						/>
					)}
				</AspectRatio>
				<Stack
					align={config.title.style?.center ? "center" : "flex-start"}
					justify="space-between"
					flex={1}
					py={0}
					my={0}
				>
					<Stack p="sm" flex={1} justify="center" gap={0}>
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
							<Title c="dimmed" order={4}>
								{title.subtitle}
							</Title>
						)}
					</Stack>
					<Container p={0} className="min-w-full">
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
		</AppShell.Header>
	);
}
