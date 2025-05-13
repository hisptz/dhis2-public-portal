"use client";

import { AppMenuConfig, MenuItemType } from "@packages/shared/schemas";
import { Tabs } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { GroupTab } from "@/components/AppMenu/components/GroupTab";
import { useGetImageUrl } from "@/utils/client/images";
import { ReactSVG } from "react-svg";

export function HeaderMenu({
	config,
	foregroundColor,
	backgroundColor,
}: {
	config: AppMenuConfig;
	foregroundColor?: string;
	backgroundColor?: string;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const getImageUrl = useGetImageUrl();

	const value = pathname.replace("/modules/", "");

	return (
		<Tabs
			style={{
				"--tab-border-color": backgroundColor,
			}}
			color={backgroundColor}
			onChange={(value) => {
				if (value !== "#") {
					router.replace(`/modules/${value}`);
				}
			}}
			classNames={{
				root: "border-(--mantine-color-anchor)",
			}}
			value={value}
		>
			<Tabs.List>
				{config.items.map((item) => {
					const icon = item.icon ? getImageUrl(item.icon) : undefined;
					if (item.type === MenuItemType.GROUP) {
						return (
							<GroupTab
								foregroundColor={foregroundColor}
								backgroundColor={backgroundColor}
								key={item.label}
								config={item}
							/>
						);
					}
					return (
						<Tabs.Tab
							style={{
								"color": foregroundColor,
								"--tab-hover-color": backgroundColor,
							}}
							classNames={{
								tabLabel: "active:font-bold",
							}}
							leftSection={
								item.icon && (
									<ReactSVG
										width={12}
										height={12}
										src={icon!}
									/>
								)
							}
							color={foregroundColor}
							value={item.path}
							key={item.path}
						>
							{item.path === value ? (
								<b>{item.label}</b>
							) : (
								item.label
							)}
						</Tabs.Tab>
					);
				})}
			</Tabs.List>
		</Tabs>
	);
}
