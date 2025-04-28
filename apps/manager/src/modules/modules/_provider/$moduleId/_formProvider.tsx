import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import { ModuleProvider } from "../../../../shared/components/ModulesPage/providers/ModuleProvider";
import { ModuleFormProvider } from "../../../../shared/components/ModulesPage/providers/ModuleFormProvider";

export const Route = createFileRoute(
	"/modules/_provider/$moduleId/_formProvider",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="w-full h-full flex flex-col py-4 px-8">
		<ModuleProvider>
			<ModuleFormProvider>
				<Outlet />
			</ModuleFormProvider>
		</ModuleProvider>
		</div>
	);
}
