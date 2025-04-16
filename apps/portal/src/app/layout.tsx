import type { Metadata } from "next";
import "./globals.css";
import "@mantine/core/styles.css";
import {
	ColorSchemeScript,
	mantineHtmlProps,
	MantineProvider,
} from "@mantine/core";
import { getAppTheme } from "@/utils/theme";

export const metadata: Metadata = {
	title: "Public Portal",
	description: "DHIS2 Public Portal",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const theme = await getAppTheme();

	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
			<body>
				<MantineProvider theme={theme}>{children}</MantineProvider>
			</body>
		</html>
	);
}
