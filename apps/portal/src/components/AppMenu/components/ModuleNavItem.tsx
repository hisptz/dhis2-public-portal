import { AppShell, NavLink, Skeleton } from "@mantine/core";
import { ModuleMenuItem } from "@packages/shared/schemas";
import Link from "next/link";

export async function ModuleNavItem({ config }: { config: ModuleMenuItem }) {
	if (!config.path) {
		if (config.itemsDisplay === "grouped") {
			return (
				<AppShell.Section>
					{config.label}
					{Array(3)
						.fill(0)
						.map((_, index) => (
							<Skeleton
								key={index}
								h={28}
								mt="sm"
								animate={false}
							/>
						))}
				</AppShell.Section>
			);
		}
		return (
			<NavLink childrenOffset={28} label={config.label}>
				{Array(3)
					.fill(0)
					.map((_, index) => (
						<Skeleton key={index} h={28} mt="sm" animate={false} />
					))}
			</NavLink>
		);
	}

	return (
		<NavLink
			active
			variant="filled"
			component={Link}
			href={config.path!}
			label={config.label}
		/>
	);
}
