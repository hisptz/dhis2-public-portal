import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MenuProvider } from "../../shared/components/MenuPage/providers/MenuProvider";
import React from "react";
import { ConfigProvider } from "../../shared/components/ConfigProvider";
import { DatastoreKeys } from "@packages/shared/constants";

export const Route = createFileRoute("/menu/_provider")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ConfigProvider dataStoreKey={DatastoreKeys.MENU} defaultConfig={[]}>
			<MenuProvider>
				<Outlet />
			</MenuProvider>
		</ConfigProvider>
	);
}
