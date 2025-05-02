import {
	AppShell,
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

export function Footer({
	config,
	header,
	logo,
}: {
	config: FooterConfig;
	header: HeaderConfig;
	logo: string;
}) {
	const { title, subtitle } = header;
	return (
		<div>
			<div
				className="relative"
				style={{
					clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0% 100%)",
				}}
			>
				<div className="sticky bottom-[calc(100vh)] h-[240px]">
					<AppShell.Footer>
						<Flex align="center" direction="column" gap="xs">
							<Container
								className="min-w-full"
								size="lg"
								flex={1}
							>
								<Container size="lg">
									<Flex p="md" gap="lg" direction="row">
										{config.showTitle && (
											<Box
												style={{
													width: "50%",
													flex: 1,
												}}
											>
												<Stack
													align="flex-start"
													gap={0}
												>
													<Box
														style={{
															width: 80,
															height: 80,
														}}
													>
														<Image
															component={
																NextImage
															}
															width={80}
															height={80}
															alt="logo"
															src={logo}
															visibleFrom="sm"
															fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
														/>
													</Box>
													<Title order={5} ta="left">
														{title.text}
													</Title>
													{subtitle?.text && (
														<Text
															size="sm"
															c="dimmed"
															ta="center"
														>
															{subtitle.text}
														</Text>
													)}
												</Stack>
											</Box>
										)}
										{config.footerItems.map(
											(item, index) => (
												<Flex
													flex={1}
													gap="lg"
													justify="space-between"
													direction="row"
												>
													{item.type === "links" ? (
														<FooterLinks
															config={{
																links:
																	item.links ??
																	[],
																title: item.title,
															}}
														/>
													) : (
														<FooterStaticContent
															config={{
																title: item.title,
																staticContent:
																	item.staticContent ??
																	"",
															}}
														/>
													)}
												</Flex>
											),
										)}
									</Flex>
									<Divider my="md" />
								</Container>
							</Container>
							<Container size="lg">
								<Text c="dimmed" ta="center">
									{config.copyright}
								</Text>
							</Container>
						</Flex>
					</AppShell.Footer>
				</div>
			</div>
		</div>
	);
}
