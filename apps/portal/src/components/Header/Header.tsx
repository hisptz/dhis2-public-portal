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
	const headerBackgroundColor = config.style?.headerBackgroundColor ?? foregroundColor;
	const titleTextColor = config.title.style?.textColor ??  foregroundColor;
	const titleTextSize = config.title.style?.textSize ?? 20;
	const subtitleTextColor = config.subtitle.style?.textColor ?? foregroundColor;
	const subtitleTextSize = config.subtitle.style?.textSize ?? 14;
	const headerTitleStackAlign =
		config.title.style?.align === "center"
			? "center"
			: config.title.style?.align ==="right"
				? "flex-end"
				: "flex-start";
	const trailingLogoSizeHeight = config.style?.trailingLogoSize?.height ?? 100
	const trailingLogoSizeWidth = config.style?.trailingLogoSize?.width ?? 100
	const leadingLogoSizeHeight = config.style?.leadingLogoSize?.height ?? 200
	const leadingLogoSizeWidth = config.style?.leadingLogoSize?.width ?? 400

	return (
		<AppShell.Header p={0} bg={headerBackgroundColor} >
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
							width={leadingLogoSizeWidth}
							height={leadingLogoSizeHeight}
							alt="logo"
							src={logo}
							visibleFrom="sm"
							fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
						/>
					)}
				</AspectRatio>
				<Stack
					align= {headerTitleStackAlign}
					justify="space-between"
					flex={1}
					py={0}
					my={0}
				>
					<Stack p="sm" flex={1} justify="space-between" gap={0}>
						<Title
							// bg={
							// 	config.style?.coloredBackground
							// 		? theme.primaryColor
							// 		: undefined
							// }
							c={titleTextColor}
							style = {{
								fontSize : titleTextSize
							}}
							order={2}
						>
							{title.main}
						</Title>
						{title.subtitle && (
							<Title c={subtitleTextColor} order={4}  style = {{
								fontSize : subtitleTextSize
							}} >
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
						width={trailingLogoSizeWidth}
						height={trailingLogoSizeHeight}
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
