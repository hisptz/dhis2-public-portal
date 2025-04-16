import {
	AppShell,
	Center,
	Container,
	Divider,
	Flex,
	Image,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { AppTitleConfig, FooterConfig } from "@packages/shared/schemas";
import NextImage from "next/image";
import { FooterLinks } from "@/components/Footer/components/FooterLinks";
import { FooterAddress } from "@/components/Footer/components/FooterAddress";

export function Footer({
	config,
	title,
	logo,
}: {
	config: FooterConfig;
	title: AppTitleConfig;
	logo: string;
}) {
	return (
		<AppShell.Footer>
			<Flex direction="column" gap="lg">
				<Container p="lg" flex={1}>
					<Flex gap="lg" direction="row">
						<div style={{ width: 400 }}>
							<Stack gap="xs">
								<div style={{ width: 80, height: 80 }}>
									<Image
										component={NextImage}
										width={80}
										height={80}
										alt="logo"
										src={logo}
										visibleFrom="sm"
										fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
									/>
								</div>
								<Title order={5} ta="left">
									{title.main}
								</Title>
								{title.subtitle && (
									<Text c="dimmed" ta="center">
										{title.subtitle}
									</Text>
								)}
							</Stack>
						</div>
						<Flex gap="lg" justify="space-between" direction="row">
							<FooterLinks config={config.footerLinks} />
							<FooterAddress config={config.address} />
						</Flex>
					</Flex>
				</Container>
				<Divider />
				<Container m="sm" fluid>
					<Center>
						<Text c="dimmed" ta="center">
							{config.copyright}
						</Text>
					</Center>
				</Container>
			</Flex>
		</AppShell.Footer>
	);
}
