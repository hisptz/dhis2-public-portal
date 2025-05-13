import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MetadataProvider } from "../../shared/components/GeneralPage/providers/GeneralProvider";
import React from "react";
import { ConfigProvider } from "../../shared/components/ConfigProvider";
import { DatastoreKeys } from "@packages/shared/constants";

export const Route = createFileRoute("/general/_provider")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ConfigProvider
			dataStoreKey={DatastoreKeys.METADATA}
			defaultConfig={{}}
		>
			<MetadataProvider>
				<Outlet />
			</MetadataProvider>
		</ConfigProvider>
	);
}
