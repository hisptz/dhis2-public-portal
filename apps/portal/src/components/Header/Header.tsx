"use client";
import {
	AppAppearanceConfig,
	AppMenuConfig,
	AppMeta,
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
} from "@mantine/core";
import NextImage from "next/image";
import { getForeground } from "@packages/shared/utils";
import { HeaderMenu } from "@/components/AppMenu/HeaderMenu";
import { getAppTheme } from "@/utils/theme";
import { useGetImageUrl } from "@/utils/client/images";

export function AppHeader({
	config,
	opened,
	toggle,
	menuConfig,
	metadata,
}: {
	config: AppAppearanceConfig;
	menuConfig: AppMenuConfig;
	opened: boolean;
	toggle: () => void;
	metadata: AppMeta;
}) {
	const hasMenu = menuConfig.items.length > 1;
	const { header: headerConfig } = config;
	const theme = getAppTheme(config);
	const backgroundColor = headerConfig?.style.usePrimaryColorAsBackgroundColor
		? config.colors.primary
		: headerConfig.style?.coloredBackground
			? theme.primaryColor
			: undefined;
	const foregroundColor = backgroundColor
		? getForeground(backgroundColor)
		: undefined;
	const headerBackgroundColor = backgroundColor ?? foregroundColor;
	const title = headerConfig.title.text;
	const subtitle = headerConfig.subtitle.text;
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

	const getImageUrl = useGetImageUrl();

	const leadingImage = getImageUrl(metadata.icon);
	const trailingImage = headerConfig.style.trailingLogo?.url
		? getImageUrl(headerConfig.style.trailingLogo?.url)
		: undefined;

	return (
		<AppShell.Header p={0} bg={headerBackgroundColor}>
			<Flex px="sm" gap="lg" align="center" p={0}>
				{hasMenu && (
					<Burger
						color={titleTextColor}
						opened={opened}
						onClick={toggle}
						hiddenFrom="sm"
						size="sm"
					/>
				)}
				{headerConfig.style?.leadingLogo?.show && (
					<Box
						style={{
							width:
								headerConfig.style?.leadingLogo?.width ?? 100,
							height:
								headerConfig.style?.leadingLogo?.height ?? 100,
						}}
					>
						<Image
							component={NextImage}
							width={
								headerConfig.style?.leadingLogo?.width ?? 100
							}
							height={
								headerConfig.style?.leadingLogo?.height ?? 100
							}
							alt="logo"
							src={leadingImage}
						/>
					</Box>
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
							{title}
						</Title>
						{subtitle && (
							<Title
								c={subtitleTextColor}
								order={4}
								style={{
									fontSize: subtitleTextSize,
									alignSelf: headerSubtitleStackAlign,
								}}
							>
								{subtitle}
							</Title>
						)}
					</Stack>
					<Container p={0} className="min-w-full">
						{menuConfig.position === "header" && hasMenu && (
							<HeaderMenu config={menuConfig} />
						)}
					</Container>
				</Stack>
				{headerConfig.style?.trailingLogo?.show && (
					<Box
						style={{
							height:
								headerConfig.style?.trailingLogo?.height ?? 100,
							width:
								headerConfig.style?.trailingLogo?.width ?? 100,
						}}
					>
						<Image
							component={NextImage}
							width={
								headerConfig.style?.trailingLogo?.width ?? 100
							}
							height={
								headerConfig.style?.trailingLogo?.height ?? 100
							}
							alt="logo"
							src={trailingImage}
							hiddenFrom="!xs"
						/>
					</Box>
				)}
			</Flex>
		</AppShell.Header>
	);
}
