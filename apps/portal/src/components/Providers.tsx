"use client";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { getAppTheme } from "@/utils/theme";
import { MantineProvider } from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import React from "react";
import { ModalsProvider } from "@mantine/modals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({
	config,
	children,
}: {
	config?: AppAppearanceConfig;
	children: React.ReactNode;
}) {
	const theme = config ? getAppTheme(config) : undefined;
	const queryClient = React.useRef(new QueryClient()).current;

	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider theme={theme}>
				<Notifications />
				<ModalsProvider>{children}</ModalsProvider>
			</MantineProvider>
		</QueryClientProvider>
	);
}
