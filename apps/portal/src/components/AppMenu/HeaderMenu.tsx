"use client";

import { AppMenuConfig, MenuItemType } from "@packages/shared/schemas";
import { Tabs } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { GroupTab } from "@/components/AppMenu/components/GroupTab";

export function HeaderMenu({ config }: { config: AppMenuConfig }) {
	const router = useRouter();
	const pathname = usePathname();

	return (
		<Tabs
			onChange={(value) => {
				if (value !== "#") {
					router.replace(`/${value}`);
				}
			}}
			value={pathname.replace("/", "")}
		>
			<Tabs.List>
				{config.items.map((item) =>
					item.type === MenuItemType.GROUP ? (
						<GroupTab key={item.label} config={item} />
					) : (
						<Tabs.Tab value={item.path} key={item.path}>
							{item.label}
						</Tabs.Tab>
					),
				)}
			</Tabs.List>
		</Tabs>
	);
}
