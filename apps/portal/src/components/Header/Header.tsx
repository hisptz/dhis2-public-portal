"use client";
import {
	AppMenuConfig,
	AppTitleConfig,
	HeaderConfig,
} from "@packages/shared/schemas";
import {
	AppShell,
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
	menuConfig,
}: {
	config: HeaderConfig;
	menuConfig: AppMenuConfig;
	title: AppTitleConfig;
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
	const headerBackgroundColor =
		config.style?.headerBackgroundColor ?? foregroundColor;
	const titleTextColor = config.title.style?.textColor ?? foregroundColor;
	const titleTextSize = config.title.style?.textSize ?? 20;
	const subtitleTextColor =
		config.subtitle.style?.textColor ?? foregroundColor;
	const subtitleTextSize = config.subtitle.style?.textSize ?? 14;
	const headerTitleStackAlign =
		config.title.style?.align === "center"
			? "center"
			: config.title.style?.align === "right"
				? "flex-end"
				: "flex-start";

	const headerSubtitleStackAlign =
		config.subtitle.style?.align === "center"
			? "center"
			: config.subtitle.style?.align === "right"
				? "flex-end"
				: "flex-start";

	return (
		<AppShell.Header p={0} bg={headerBackgroundColor}>
			<Flex px="sm" gap="lg" align="center" p={0}>
				<Burger
					opened={opened}
					onClick={toggle}
					hiddenFrom="sm"
					size="sm"
				/>

				{config.logo.enabled && (
					<Image
						component={NextImage}
						width={config.style?.leadingLogo?.width ?? 100}
						height={config.style?.leadingLogo?.height ?? 100}
						alt="logo"
						src={config.style?.leadingLogo?.url}
						visibleFrom="sm"
						fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
					/>
				)}
				<Stack
					align={headerTitleStackAlign}
					justify="space-between"
					flex={1}
					py={0}
					my={0}
				>
					<Stack p="sm" flex={1} justify="space-between" gap={0}>
						<Title
							c={titleTextColor}
							style={{
								fontSize: titleTextSize,
								alignSelf: headerTitleStackAlign,
							}}
							order={2}
						>
							{title.main}
						</Title>
						{title.subtitle && (
							<Title
								c={subtitleTextColor}
								order={4}
								style={{
									fontSize: subtitleTextSize,
									alignSelf: headerSubtitleStackAlign,
								}}
							>
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
				{config.style?.trailingLogo && (
					<Image
						component={NextImage}
						width={config.style?.trailingLogo?.width ?? 100}
						height={config.style?.trailingLogo?.height ?? 100}
						alt="logo"
						src={config.style?.trailingLogo?.url}
						hiddenFrom="!xs"
						fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
					/>
				)}
			</Flex>
		</AppShell.Header>
	);
}
