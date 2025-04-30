import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import { LibrariesProvider } from "../../shared/components/LibrariesProvider";

export const Route = createFileRoute("/library/_provider")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<LibrariesProvider>
			<Outlet />
		</LibrariesProvider>
	);
}
