import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Public Portal",
	description: "DHIS2 Public Portal",
};

export default function RootLayout({
	childre,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
