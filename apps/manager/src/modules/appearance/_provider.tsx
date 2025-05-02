import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import { ConfigProvider } from "../../shared/components/ConfigProvider";
import { DatastoreKeys } from "@packages/shared/constants";
import { defaultAppearanceConfig } from "../../shared/constants/defaults/appearance-config";

export const Route = createFileRoute("/appearance/_provider")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ConfigProvider
			dataStoreKey={DatastoreKeys.APPEARANCE}
			defaultConfig={defaultAppearanceConfig}
		>
			<Outlet />
		</ConfigProvider>
	);
}
