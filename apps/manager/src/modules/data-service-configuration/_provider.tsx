import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DataSourcesProvider } from "../../shared/components/DataConfiguration/providers/DataSourcesProvider";
import React from "react";

export const Route = createFileRoute("/data-service-configuration/_provider")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<DataSourcesProvider>
			<Outlet />
		</DataSourcesProvider>
	);
}
