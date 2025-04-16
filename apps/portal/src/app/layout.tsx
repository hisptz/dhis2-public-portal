import type { Metadata } from "next";
import "./globals.css";
import "@mantine/core/styles.css";
import {
	ColorSchemeScript,
	mantineHtmlProps,
	MantineProvider,
} from "@mantine/core";
import { getAppearanceConfig } from "@/utils/theme";
import { MainLayout } from "@/components/MainLayout";

export const metadata: Metadata = {
	title: "Public Portal",
	description: "DHIS2 Public Portal",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { appearanceConfig, theme } = await getAppearanceConfig();

	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
			<body>
				<MantineProvider theme={theme}>
					<MainLayout appearanceConfig={appearanceConfig}>
						{children}
					</MainLayout>
				</MantineProvider>
			</body>
		</html>
	);
}
