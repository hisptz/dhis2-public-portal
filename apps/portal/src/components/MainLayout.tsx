"use client";

import {
	AppAppearanceConfig,
	AppMenuConfig,
	MenuPosition,
} from "@packages/shared/schemas";
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
	const hasMenuOnHeader = menuConfig.position === MenuPosition.HEADER;
	const headerHeight = appearanceConfig.header.style?.containerHeight ?? 138;

	return (
		<AppShell
			header={{
				height: {
					base: hasMenuOnHeader ? headerHeight : 138 - 20,
				},
			}}
			footer={{ height: { base: 100, md: 100, lg: 240 } }}
			navbar={{
				width: { base: 200, md: 240, lg: 300 },
				breakpoint: "sm",
				collapsed: {
					mobile: !opened,
					desktop: hasMenuOnHeader,
				},
			}}
			padding="md"
		>
			<AppHeader
				menuConfig={menuConfig}
				logo={appearanceConfig.logo}
				title={appearanceConfig!.title}
				opened={opened}
				toggle={toggle}
				config={appearanceConfig!.header}
			/>
			<SideAppMenu menuConfig={menuConfig} />
			<AppShell.Main style={{ background: "#F9F9FA" }}>
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
