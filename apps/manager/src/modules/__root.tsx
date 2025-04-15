import * as React from "react";
import { createRootRoute } from "@tanstack/react-router";
import i18n from "@dhis2/d2-i18n";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<React.Fragment>
			<div className="w-screen h-screen flex items-center justify-center">
				<h1>{i18n.t("Welcome to DHIS2 Public Portal Manager!")}</h1>
			</div>
		</React.Fragment>
	);
}
