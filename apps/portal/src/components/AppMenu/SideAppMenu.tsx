import {
	AppShell,
	Burger,
	Group,
	ScrollArea,
	useMantineTheme,
} from "@mantine/core";
import { AppMenuConfig } from "@packages/shared/schemas";
import classes from "./NavbarNested.module.css";
import { LinksGroup } from "@/components/AppMenu/components/NavbarLinksGroup";
import { Dispatch, SetStateAction } from "react";
import { useMediaQuery } from "usehooks-ts";
import { usePathname } from "next/navigation";

export function SideAppMenu({
	menuConfig,
	isOpen,
	setOpen,
}: {
	menuConfig: AppMenuConfig;
	isOpen: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
}) {
	const theme = useMantineTheme();
	const pathname = usePathname();
	const isLargerThanSm = useMediaQuery(
		`(min-width: ${theme.breakpoints.sm})`,
	);

	if (!menuConfig) {
		return null;
	}

	if (menuConfig.position === "header") {
		return null;
	}

	const toggleSideMenu = () => setOpen((prev) => !prev);

	const links = menuConfig.items
		.sort((a, b) => a.sortOrder - b.sortOrder)
		.map((item) => {
			const isActive = item.path && pathname.includes(item.path);

			const hasActiveSubmenu =
				item.type === "group"
					? item.items?.some(
							(subMenu) =>
								subMenu.path && pathname.includes(subMenu.path),
						)
					: false;

			return (
				<LinksGroup
					key={item.label}
					label={item.label}
					collapsed={!isOpen}
					icon={item.icon}
					initiallyOpened={isActive || hasActiveSubmenu}
					path={item.type === "module" ? item.path : undefined}
					onOpen={
						item.type === "group" ? () => setOpen(true) : undefined
					}
					subMenus={
						item.type === "group"
							? item.items
									.sort((a, b) => a.sortOrder - b.sortOrder)
									.map((item) => {
										return {
											key: item.label,
											icon: item.icon,
											path: item.path,
											label: item.label,
										};
									})
							: undefined
					}
				/>
			);
		});

	return (
		<AppShell.Navbar
			p="xs"
			style={{
				transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
				overflow: "hidden",
			}}
		>
			{isLargerThanSm && (
				<Group justify={isOpen ? "flex-end" : "center"} p="xs">
					<Burger
						opened={isOpen}
						onClick={toggleSideMenu}
						size="sm"
					/>
				</Group>
			)}

			<ScrollArea className={classes.links}>
				{links.map((link, index) => (
					<div key={index}>{link}</div>
				))}
			</ScrollArea>
		</AppShell.Navbar>
	);
}
