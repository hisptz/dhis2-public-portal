"use client";
import { AppAppearanceConfig, AppMenuConfig } from "@packages/shared/schemas";
import {
	AppShell,
	Burger,
	Container,
	Flex,
	Image,
	Stack,
	Title,
} from "@mantine/core";
import NextImage from "next/image";
import { getForeground } from "@packages/shared/utils";
import { HeaderMenu } from "@/components/AppMenu/HeaderMenu";
import { getAppTheme } from "@/utils/theme";

export function AppHeader({
	config,
	opened,
	toggle,
	menuConfig,
}: {
	config: AppAppearanceConfig;
	menuConfig: AppMenuConfig;
	opened: boolean;
	toggle: () => void;
}) {
	const { header: headerConfig, title } = config;
	const theme = getAppTheme(config);
	const backgroundColor = headerConfig.style?.coloredBackground
		? theme.primaryColor
		: undefined;
	const foregroundColor = backgroundColor
		? getForeground(backgroundColor)
		: undefined;
	const headerBackgroundColor = backgroundColor ?? foregroundColor;
	const titleTextColor =
		headerConfig.title.style?.textColor ?? foregroundColor;
	const titleTextSize = headerConfig.title.style?.textSize ?? 20;
	const subtitleTextColor =
		headerConfig.subtitle.style?.textColor ?? foregroundColor;
	const subtitleTextSize = headerConfig.subtitle.style?.textSize ?? 14;
	const headerTitleStackAlign =
		headerConfig.title.style?.align === "center"
			? "center"
			: headerConfig.title.style?.align === "right"
				? "flex-end"
				: "flex-start";

	const headerSubtitleStackAlign =
		headerConfig.subtitle.style?.align === "center"
			? "center"
			: headerConfig.subtitle.style?.align === "right"
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

				{headerConfig.logo.enabled && (
					<Image
						component={NextImage}
						width={headerConfig.style?.leadingLogo?.width ?? 100}
						height={headerConfig.style?.leadingLogo?.height ?? 100}
						alt="logo"
						src={headerConfig.style?.leadingLogo?.url}
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
				{headerConfig.style?.trailingLogo && (
					<Image
						component={NextImage}
						width={headerConfig.style?.trailingLogo?.width ?? 100}
						height={headerConfig.style?.trailingLogo?.height ?? 100}
						alt="logo"
						src={headerConfig.style?.trailingLogo?.url}
						hiddenFrom="!xs"
						fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
					/>
				)}
			</Flex>
		</AppShell.Header>
	);
}
