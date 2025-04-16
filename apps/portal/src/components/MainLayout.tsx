"use client";

import { AppAppearanceConfig } from "@packages/shared/schemas";
import { AppShell } from "@mantine/core";
import { AppHeader } from "@/components/Header/Header";
import { useDisclosure } from "@mantine/hooks";

export function MainLayout({
	children,
	appearanceConfig,
}: {
	children: React.ReactNode;
	appearanceConfig: AppAppearanceConfig;
}) {
	const [opened, { toggle }] = useDisclosure();

	return (
		<AppShell
			header={{ height: { base: 100, md: 100, lg: 100 } }}
			// navbar={{
			// 	width: { base: 200, md: 300, lg: 400 },
			// 	breakpoint: "sm",
			// 	collapsed: { mobile: !opened },
			// }}
			padding="md"
		>
			<AppHeader
				opened={opened}
				toggle={toggle}
				config={appearanceConfig!.header}
			/>
			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
}
