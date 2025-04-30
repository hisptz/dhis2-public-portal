"use client";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { getAppTheme } from "@/utils/theme";
import { MantineProvider } from "@mantine/core";
import React from "react";

export function Providers({
	config,
	children,
}: {
	config: AppAppearanceConfig;
	children: React.ReactNode;
}) {
	const theme = getAppTheme(config);

	return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
