import {
	Box,
	Container,
	Divider,
	Flex,
	Image,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { FooterConfig, HeaderConfig } from "@packages/shared/schemas";
import NextImage from "next/image";
import { FooterLinks } from "@/components/Footer/components/FooterLinks";
import { FooterStaticContent } from "@/components/Footer/components/FooterStaticContent";
import { getForeground } from "@packages/shared/utils";

export function Footer({
	config,
	header,
	primaryColor,
	logo,
}: {
	config: FooterConfig;
	header: HeaderConfig;
	primaryColor: string;
	logo: string;
}) {
	const backgroundColor = config.coloredBackground
		? config.usePrimaryColorAsBackgroundColor
			? primaryColor
			: config.footerBackgroundColor
		: "#FFFFFF";
	const foregroundColor = backgroundColor
		? getForeground(backgroundColor)
		: undefined;
	const headerBackgroundColor = backgroundColor ?? foregroundColor;
	const { title, subtitle } = header;
	return (
		<div
			style={{
				background: headerBackgroundColor,
				color: foregroundColor,
			}}
		>
			<Flex
				align="center"
				direction="column"
				justify="space-between"
				w="100%"
				style={{
					borderTop: "1px solid #e9ecef",
				}}
			>
				<Container className="min-w-full" size="lg">
					<Container size="lg">
						<Flex p="md" gap="lg" direction="row" wrap="wrap">
							{config.showTitle && (
								<Box style={{ flex: 1, minWidth: 200 }}>
									<Stack align="flex-start" gap="xs">
										<Box style={{ width: 60, height: 60 }}>
											<Image
												component={NextImage}
												width={60}
												height={60}
												alt="logo"
												src={logo}
											/>
										</Box>
										<Stack gap={0}>
											<Title order={5} ta="left">
												{title.text}
											</Title>
											{subtitle?.text && (
												<Text
													c={
														foregroundColor ==
														"black"
															? "dimmed"
															: foregroundColor
													}
													size="sm"
													ta="left"
												>
													{subtitle.text}
												</Text>
											)}
										</Stack>
									</Stack>
								</Box>
							)}

							{config.footerItems.map((item, index) => (
								<Flex
									key={index}
									flex={1}
									gap="lg"
									justify="space-between"
									direction="row"
									style={{ minWidth: 200 }}
								>
									{item.type === "links" ? (
										<FooterLinks
											color={foregroundColor}
											config={{
												links: item.links ?? [],
												title: item.title,
											}}
										/>
									) : (
										<FooterStaticContent
											config={{
												title: item.title,
												staticContent:
													item.staticContent ?? "",
											}}
										/>
									)}
								</Flex>
							))}
						</Flex>
					</Container>
				</Container>
			</Flex>
			<Divider my="md" mx="xl" />
			<Container size="lg" pb="xs">
				<Text
					c={foregroundColor == "black" ? "dimmed" : foregroundColor}
					ta="center"
				>
					{config.copyright}
				</Text>
			</Container>
		</div>
	);
}
