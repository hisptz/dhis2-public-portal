"use client";

import { NavLink } from "@mantine/core";
import { ModuleMenuItem } from "@packages/shared/schemas";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ModuleNavItem({ config }: { config: ModuleMenuItem }) {
	const pathname = usePathname();
	const active = pathname.includes(config.path);

	return (
		<NavLink
			prefetch
			active={active}
			variant="filled"
			component={Link}
			href={`/${config.path}`}
			label={config.label}
		/>
	);
}
