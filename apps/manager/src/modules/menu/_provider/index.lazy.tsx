import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import { ModuleContainer } from "../../../shared/components/ModuleContainer";
import { useMenu } from "../../../shared/components/MenuPage/providers/MenuProvider";

export const Route = createLazyFileRoute("/menu/_provider/")({
	component: RouteComponent,
});

function RouteComponent() {
	const data = useMenu();
		console.log("data", data);
	return (
		<ModuleContainer title="App Menu">
			<div className="w-full h-full">A table of menu items</div>
		</ModuleContainer>
	);
}
