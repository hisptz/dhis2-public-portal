import * as React from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { SideMenu } from "../shared/components/SideMenu/SideMenu";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<React.Fragment>
			<div className="h-full w-full flex">
				<SideMenu />
				<main className="flex-1 h-full p-[16px]">
					<Outlet />
				</main>
			</div>
		</React.Fragment>
	);
}
