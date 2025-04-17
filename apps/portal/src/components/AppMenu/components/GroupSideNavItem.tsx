import { AppShell, NavLink } from "@mantine/core";
import { GroupMenuItem } from "@packages/shared/schemas";
import { ModuleNavItem } from "@/components/AppMenu/components/ModuleNavItem";

export function GroupSideNavItem({ config }: { config: GroupMenuItem }) {
	return (
		<AppShell.Section my="md">
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
