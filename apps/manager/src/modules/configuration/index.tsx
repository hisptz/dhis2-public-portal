import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { ConfigurationPage } from "../../shared/components/ConfigurationPage/ConfigurationPage";
import { ModuleContainer } from "../../shared/components/ModuleContainer";
import i18n from "@dhis2/d2-i18n";

export const Route = createFileRoute("/configuration/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ModuleContainer title={i18n.t("Import/Export Configuration")}>
			<ConfigurationPage />
		</ModuleContainer>
	);
}
