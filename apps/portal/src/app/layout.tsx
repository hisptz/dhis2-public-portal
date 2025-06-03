import "./globals.css";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { getAppMetadata } from "@/utils/appMetadata";
import { DHIS2AppProvider } from "@/components/DHIS2AppProvider";
import { getSystemInfo } from "@/utils/systemInfo";
import { NavigationBar } from "@/components/NavigationBar";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Providers } from "@/components/Providers";
import { getAppearanceConfig } from "@/utils/config/appConfig";
import { env } from "@/utils/env";

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
	const contextPath = env.CONTEXT_PATH ?? "";

	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
			<body>
				<Providers config={config?.appearanceConfig}>
					<NavigationBar config={config} />
					<DHIS2AppProvider
						contextPath={contextPath}
						systemInfo={systemInfo}
					>
						{children}
					</DHIS2AppProvider>
				</Providers>
			</body>
		</html>
	);
}
