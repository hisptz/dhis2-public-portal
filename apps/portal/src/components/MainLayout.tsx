"use client";

import { AppAppearanceConfig, AppMenuConfig } from "@packages/shared/schemas";
import { AppShell, Center, Loader } from "@mantine/core";
import { AppHeader } from "@/components/Header/Header";
import { useDisclosure } from "@mantine/hooks";
import { Suspense } from "react";
import { Footer } from "@/components/Footer/Footer";
import { SideAppMenu } from "@/components/AppMenu/SideAppMenu";

export function MainLayout({
	children,
	appearanceConfig,
	menuConfig,
}: {
	children: React.ReactNode;
	appearanceConfig: AppAppearanceConfig;
	menuConfig: AppMenuConfig;
}) {
	const [opened, { toggle }] = useDisclosure();

	return (
		<AppShell
			header={{ height: { base: 100, md: 100, lg: 100 } }}
			footer={{ height: { base: 100, md: 100, lg: 240 } }}
			navbar={
				menuConfig.position === "header"
					? undefined
					: {
							width: { base: 200, md: 240, lg: 300 },
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
			<SideAppMenu menuConfig={menuConfig} />
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
