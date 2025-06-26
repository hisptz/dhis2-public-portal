"use client";

import { AppAppearanceConfig, AppMenuConfig, AppMeta, MenuPosition } from "@packages/shared/schemas";
import { AppShell, Center, Loader, useMantineTheme } from "@mantine/core";
import { AppHeader } from "@/components/Header/Header";
import { useDisclosure } from "@mantine/hooks";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
	const [navbarWidth, setNavbarWidth] = useState(0);
	const getImageUrl = useGetImageUrl();

	const logo = getImageUrl(metadata.icon);

	const footerRef = useRef<HTMLDivElement>(null);
	const [footerHeight, setFooterHeight] = useState(0);

	const remToPx = (rem: string) => parseFloat(rem) * 16;

	const getNavbarWidth = () => {
		if (!hasMenu || hasMenuOnHeader) return 0;
		if (isLargerThanSm) {
			if (window.innerWidth >= remToPx(theme.breakpoints.lg)) {
				return isOpen ? 300 : 70;
			} else if (window.innerWidth >= remToPx(theme.breakpoints.md)) {
				return isOpen ? 240 : 70;
			} else {
				return isOpen ? 200 : 70;
			}
		}
		return 0;
	};

	useEffect(() => {
		if (footerRef.current) {
			const observer = new ResizeObserver(() => {
				setFooterHeight(footerRef.current?.offsetHeight ?? 0);
			});
			observer.observe(footerRef.current);
			return () => observer.disconnect();
		}
	}, []);

	const updateNavbarWidth = useCallback(() => {
		const width = getNavbarWidth();
		setNavbarWidth(width);
	}, [isOpen, isLargerThanSm, hasMenu, hasMenuOnHeader]);

	useEffect(() => {
		updateNavbarWidth();
		window.addEventListener("resize", updateNavbarWidth);
		return () => window.removeEventListener("resize", updateNavbarWidth);
	}, [updateNavbarWidth]);

	return (
		<div className="relative min-h-screen bg-[#F9F9FA]">
			<AppShell
				header={{
					height: {
						base: hasMenuOnHeader
							? headerHeight + 50
							: headerHeight,
					},
				}}
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
						isOpen={
							menuConfig.collapsible
								? isLargerThanSm
									? isOpen
									: opened
								: true
						}
						setOpen={setOpen}
					/>
				)}

				<AppShell.Main
					style={{
						background: "#F9F9FA",
						marginBottom: footerHeight,
						position: "relative",
						zIndex: 10,
					}}
				>
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
			</AppShell>

			<div
				ref={footerRef}
				style={{
					position: "fixed",
					bottom: 0,
					left: navbarWidth,
					width: `calc(100% - ${navbarWidth}px)`,
					zIndex: 0,
				}}
			>
				<Footer
					logo={logo}
					primaryColor={appearanceConfig.colors.primary}
					header={appearanceConfig!.header}
					config={appearanceConfig!.footer}
				/>
			</div>
		</div>
	);
}
