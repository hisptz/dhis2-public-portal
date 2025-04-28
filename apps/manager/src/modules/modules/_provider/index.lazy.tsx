import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import { ModuleContainer } from "../../../shared/components/ModuleContainer";
import i18n from "@dhis2/d2-i18n";

export const Route = createLazyFileRoute("/modules/_provider/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ModuleContainer title={i18n.t("Modules")}>
			<div className="w-full h-full">table of configured modules</div>
		</ModuleContainer>
	);
}
