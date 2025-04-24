import { createLazyFileRoute } from "@tanstack/react-router";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { ModuleContainer } from "../../../shared/components/ModuleContainer";

export const Route = createLazyFileRoute("/general/_provider/")({
	component: RouteComponent,
});

function RouteComponent() {

	return (
		<ModuleContainer title={i18n.t("General configuration")}>
			<div>
				Applicable configuration include
				<ul>
					<li>App name</li>
					<li>App description</li>
					<li>App icon</li>
				</ul>
			</div>
		</ModuleContainer>
	);
}
