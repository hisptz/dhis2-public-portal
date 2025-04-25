import "./globals.css";
import "@mantine/core/styles.css";
import {
	ColorSchemeScript,
	mantineHtmlProps,
	MantineProvider,
} from "@mantine/core";
import { getAppearanceConfig } from "@/utils/theme";
import { getAppMetadata } from "@/utils/appMetadata";
import { DHIS2AppProvider } from "@/components/DHIS2AppProvider";
import { getSystemInfo } from "@/utils/systemInfo";
import { NoConfigLandingPage } from "@/components/NoConfigLandingPage";
import { NavigationBar } from "@/components/NavigationBar";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { ModalsProvider } from "@mantine/modals";

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
				<body
					className="h-screen w-screen"
					style={{ overflow: "hidden" }}
				>
					<MantineProvider>
						<NoConfigLandingPage />
					</MantineProvider>
				</body>
			</html>
		);
	}
	const { theme } = config;

	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
			<body >
				<MantineProvider theme={theme}>
					<ModalsProvider>
						<NavigationBar />
						<DHIS2AppProvider systemInfo={systemInfo}>
							{children}
						</DHIS2AppProvider>
					</ModalsProvider>
				</MantineProvider>
			</body>
		</html>
	);
}
