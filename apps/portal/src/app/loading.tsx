import { Center, Flex, Image, Loader, Stack, Text, Title } from "@mantine/core";
import NextImage from "next/image";
import { NoConfigLandingPage } from "@/components/NoConfigLandingPage";
import { getAppearanceConfig } from "@/utils/config/appConfig";
import { Providers } from "@/components/Providers";
import { getAppMeta } from "@/utils/appMetadata";
import { useGetImageUrl } from "@/utils/images";

export default async function MainLoadingScreen() {
	const config = await getAppearanceConfig();
	const appMeta = await getAppMeta();

	const getIconUrl = useGetImageUrl();

	const logo = appMeta?.icon ? getIconUrl(appMeta?.icon) : undefined;

	if (!config) {
		return <NoConfigLandingPage />;
	}

	const { appearanceConfig } = config;

	return (
		<Providers config={appearanceConfig}>
			<div className="h-screen w-screen">
				<Flex h="100%" direction="column" justify="space-between">
					<Center flex={1}>
						<Stack align="center">
							<div className="w-[160px] h-[160px] items-center justify-center flex">
								{logo && (
									<Image
										width={160}
										height={160}
										component={NextImage}
										src={logo}
										alt="logo"
									/>
								)}
							</div>
							<Loader />
							<Title
								ta="center"
								c={appearanceConfig.colors.primary}
								order={2}
							>
								{appearanceConfig?.header?.title?.text}
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
		</Providers>
	);
}
