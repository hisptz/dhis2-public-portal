import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import { ModuleContainer } from "../../../shared/components/ModuleContainer";

export const Route = createLazyFileRoute("/menu/_provider/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ModuleContainer title="App Menu">
			<div className="w-full h-full">A table of menu items</div>
		</ModuleContainer>
	);
}
