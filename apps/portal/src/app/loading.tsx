import { Center, Flex, Image, Loader, Stack, Text, Title } from "@mantine/core";
import { getAppearanceConfig } from "@/utils/theme";
import NextImage from "next/image";
import { NoConfigLandingPage } from "@/components/NoConfigLandingPage";

export default async function MainLoadingScreen() {
	const config = await getAppearanceConfig();

	if (!config) {
		return <NoConfigLandingPage />;
	}

	const { appearanceConfig } = config;

	return (
		<div className="h-screen w-screen">
			<Flex h="100%" direction="column" justify="space-between">
				<Center flex={1}>
					<Stack align="center">
						<div className="w-[160px] h-[160px] items-center justify-center flex">
							<Image
								width={160}
								height={160}
								component={NextImage}
								src={appearanceConfig.logo}
								alt="logo"
								fallbackSrc="https://avatars.githubusercontent.com/u/1089987?s=200&v=4"
							/>
						</div>
						<Loader />
						<Title
							ta="center"
							c={appearanceConfig.colors.primary}
							order={2}
						>
							{appearanceConfig.title.main}
						</Title>
					</Stack>
				</Center>
				<Text
					fw={700}
					c={appearanceConfig.colors.primary}
					p="sm"
					ta="center"
				>
					Powered by
					<Text inherit href={"https://dhis.org"} component="a">
						{" "}
						DHIS2
					</Text>
				</Text>
			</Flex>
		</div>
	);
}
