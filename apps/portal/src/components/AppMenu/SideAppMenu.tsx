import { AppShell } from "@mantine/core";
import { AppMenuConfig } from "@packages/shared/schemas";
import { GroupSideNavItem } from "@/components/AppMenu/components/GroupSideNavItem";
import { ModuleNavItem } from "@/components/AppMenu/components/ModuleNavItem";

export function SideAppMenu({ menuConfig }: { menuConfig: AppMenuConfig }) {
	if (!menuConfig) {
		return null;
	}

	if (menuConfig.position === "header") {
		return null;
	}

	return (
		<AppShell.Navbar p="xs">
			{menuConfig.items.map((item) =>
				item.type === "group" ? (
					<GroupSideNavItem key={item.label} config={item} />
				) : (
					<ModuleNavItem key={item.label} config={item} />
				),
			)}
		</AppShell.Navbar>
	);
}
