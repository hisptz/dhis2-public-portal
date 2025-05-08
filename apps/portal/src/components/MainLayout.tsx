"use client";

import {
	AppAppearanceConfig,
	AppMenuConfig,
	AppMeta,
	MenuPosition,
} from "@packages/shared/schemas";
import { AppShell, Center, Loader, useMantineTheme } from "@mantine/core";
import { AppHeader } from "@/components/Header/Header";
import { useDisclosure } from "@mantine/hooks";
import { Suspense, useState } from "react";
import { Footer } from "@/components/Footer/Footer";
import { SideAppMenu } from "@/components/AppMenu/SideAppMenu";
import { useMediaQuery } from "usehooks-ts";
import { useGetImageUrl } from "@/utils/client/images";

const DEFAULT_HEADER_HEIGHT = 138;

export function MainLayout({
	children,
	appearanceConfig,
	menuConfig,
	metadata,
}: {
	children: React.ReactNode;
	appearanceConfig: AppAppearanceConfig;
	menuConfig: AppMenuConfig;
	metadata: AppMeta;
}) {
	const [opened, { toggle }] = useDisclosure();
	const hasMenuOnHeader = menuConfig.position === MenuPosition.HEADER;
	const hasMenu = menuConfig.items.length > 1;
	const headerHeight =
		appearanceConfig.header.style?.containerHeight ?? DEFAULT_HEADER_HEIGHT;
	const [isOpen, setOpen] = useState(true);
	const theme = useMantineTheme();
	const isLargerThanSm = useMediaQuery(
		`(min-width: ${theme.breakpoints.sm})`,
	);

	const getImageUrl = useGetImageUrl();

	const logo = getImageUrl(metadata.icon);

	return (
		<AppShell
			header={{
				height: {
					base: hasMenuOnHeader ? headerHeight : headerHeight - 20,
				},
			}}
			footer={{ height: { base: 100, md: 100, lg: 240 } }}
			navbar={{
				width: {
					base: isOpen ? 200 : 70,
					md: isOpen ? 240 : 70,
					lg: isOpen ? 300 : 70,
				},
				breakpoint: "sm",
				collapsed: {
					mobile: !opened,
					desktop: !hasMenu || hasMenuOnHeader,
				},
			}}
			padding="md"
		>
			<AppHeader
				metadata={metadata}
				menuConfig={menuConfig}
				opened={opened}
				toggle={toggle}
				config={appearanceConfig!}
			/>
			{hasMenu && (
				<SideAppMenu
					menuConfig={menuConfig}
					isOpen={isLargerThanSm ? isOpen : opened}
					setOpen={setOpen}
				/>
			)}
			<AppShell.Main style={{ background: "#F9F9FA", paddingBottom: 16 }}>
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
				logo={logo}
				header={appearanceConfig!.header}
				config={appearanceConfig!.footer}
			/>
		</AppShell>
	);
}
