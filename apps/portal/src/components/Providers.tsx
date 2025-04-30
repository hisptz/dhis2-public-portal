"use client";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { getAppTheme } from "@/utils/theme";
import { MantineProvider } from "@mantine/core";
import React from "react";
import { ModalsProvider } from "@mantine/modals";

export function Providers({
	config,
	children,
}: {
	config: AppAppearanceConfig;
	children: React.ReactNode;
}) {
	const theme = getAppTheme(config);

	return (
		<MantineProvider theme={theme}>
			<ModalsProvider>{children}</ModalsProvider>
		</MantineProvider>
	);
}
