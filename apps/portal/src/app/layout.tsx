import "./globals.css";
import "@mantine/core/styles.css";
import {
	ColorSchemeScript,
	mantineHtmlProps,
	MantineProvider,
} from "@mantine/core";
import { getAppearanceConfig } from "@/utils/theme";
import { MainLayout } from "@/components/MainLayout";
import { getAppMetadata } from "@/utils/appMetadata";
import { DHIS2AppProvider } from "@/components/DHIS2AppProvider";
import { getSystemInfo } from "@/utils/systemInfo";
import { NoConfigLandingPage } from "@/components/NoConfigLandingPage";
import { NavigationBar } from "@/components/NavigationBar";

export async function generateMetadata() {
	return await getAppMetadata();
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const config = await getAppearanceConfig();
	const systemInfo = await getSystemInfo();

	if (!config) {
		return (
			<html lang="en" {...mantineHtmlProps}>
				<head>
					<ColorSchemeScript />
				</head>
				<body>
					<MantineProvider>
						<NoConfigLandingPage />
					</MantineProvider>
				</body>
			</html>
		);
	}
	const { theme, appearanceConfig, menuConfig } = config;

	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
			<body>
				<MantineProvider theme={theme}>
					<NavigationBar />
					<DHIS2AppProvider systemInfo={systemInfo}>
						<MainLayout
							menuConfig={menuConfig}
							appearanceConfig={appearanceConfig}
						>
							{children}
						</MainLayout>
					</DHIS2AppProvider>
				</MantineProvider>
			</body>
		</html>
	);
}
