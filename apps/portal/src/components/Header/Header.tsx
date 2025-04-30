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

	const trailingLogoSizeHeight = config.style?.trailingLogo?.height ?? 100;
	const trailingLogoSizeWidth = config.style?.trailingLogo?.width ?? 100;
	const leadingLogoSizeHeight = config.style?.leadingLogo?.height ?? 200;
	const leadingLogoSizeWidth = config.style?.leadingLogo?.width ?? 400;

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
						width={leadingLogoSizeWidth}
						height={leadingLogoSizeHeight}
						alt="logo"
						src={logo}
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
							// bg={
							// 	config.style?.coloredBackground
							// 		? theme.primaryColor
							// 		: undefined
							// }
							c={titleTextColor}
							style={{
								fontSize: titleTextSize,
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
				{config.style?.trailingLogo?.url && (
					<Image
						component={NextImage}
						width={trailingLogoSizeWidth}
						height={trailingLogoSizeHeight}
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
