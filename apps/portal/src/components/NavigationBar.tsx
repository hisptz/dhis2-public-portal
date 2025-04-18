"use client";

import NextTopLoader from "nextjs-toploader";
import { useMantineTheme } from "@mantine/core";

export function NavigationBar() {
	const theme = useMantineTheme();
	return (
		<NextTopLoader
			color={theme!.colors![theme.primaryColor as string]![5]}
		/>
	);
}
