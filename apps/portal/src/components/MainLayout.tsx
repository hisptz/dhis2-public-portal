"use client";

import { AppAppearanceConfig } from "@packages/shared/schemas";
import { AppShell, Center, Loader } from "@mantine/core";
import { AppHeader } from "@/components/Header/Header";
import { useDisclosure } from "@mantine/hooks";
import { Suspense } from "react";
import { Footer } from "@/components/Footer/Footer";

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
			navbar={
				appearanceConfig.header.hasMenu
					? undefined
					: {
							width: { base: 200, md: 300, lg: 400 },
							breakpoint: "sm",
							collapsed: { mobile: !opened },
						}
			}
			padding="md"
		>
			<AppHeader
				logo={appearanceConfig.logo}
				title={appearanceConfig!.title}
				opened={opened}
				toggle={toggle}
				config={appearanceConfig!.header}
			/>
			<AppShell.Main>
				<Suspense
					fallback={
						<Center>
							<Loader />
						</Center>
					}
				>
					{children}
				</Suspense>
			</AppShell.Main>
			<Footer
				logo={appearanceConfig.logo}
				title={appearanceConfig!.title}
				config={appearanceConfig!.footer}
			/>
		</AppShell>
	);
}
