"use client";

import { AppShell, NavLink } from "@mantine/core";
import { GroupMenuItem } from "@packages/shared/schemas";
import { ModuleNavItem } from "@/components/AppMenu/components/ModuleNavItem";
import { usePathname } from "next/navigation";

export function GroupSideNavItem({ config }: { config: GroupMenuItem }) {
	const pathname = usePathname();

	const active = pathname.includes(config.path);
	if (config.itemsDisplay === "dropdown") {
		return (
			<NavLink active={active} variant="light" label={config.label}>
				{config.items.map((item) => (
					<ModuleNavItem key={item.moduleId} config={item} />
				))}
			</NavLink>
		);
	}

	return (
		<AppShell.Section>
			<NavLink
				variant="light"
				color="gray"
				disabled
				label={config.label}
			/>
			{config.items.map((item) => (
				<ModuleNavItem key={item.moduleId} config={item} />
			))}
		</AppShell.Section>
	);
}
