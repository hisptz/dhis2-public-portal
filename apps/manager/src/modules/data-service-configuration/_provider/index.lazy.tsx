import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import { PageHeader } from "../../../shared/components/PageHeader";
import i18n from "@dhis2/d2-i18n";
import { ConfigurationList } from "../../../shared/components/DataConfiguration/components/ConfigurationList";
import { AddDataSource } from "../../../shared/components/DataConfiguration/components/AddDataSource";
import { ModuleContainer } from "../../../shared/components/ModuleContainer";

export const Route = createLazyFileRoute(
	"/data-service-configuration/_provider/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ModuleContainer title={i18n.t("Data service configuration")}>
			
				<ConfigurationList />
	
		</ModuleContainer>

	);
}
