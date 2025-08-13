import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import { useWatch } from "react-hook-form";
import { DataServiceConfig } from "@packages/shared/schemas";
import { PageHeader } from "../../../../../shared/components/PageHeader";
import { SourceConfiguration } from "../../../../../shared/components/DataConfiguration/components/SourceConfiguration";
import { VisualizationsConfig } from "../../../../../shared/components/DataConfiguration/components/VisualizationsConfig";
import { DataItemsConfig } from "../../../../../shared/components/DataConfiguration/components/DataItemsConfig/DataItemsConfig";

export const Route = createLazyFileRoute(
	"/data-service-configuration/_provider/$configId/_provider/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const source = useWatch<DataServiceConfig, "source">({
		name: "source",
	});

	return (
		<div className="h-full w-full flex flex-col gap-4">
			<PageHeader title={source.name} />
			<div className="flex-1 flex flex-col gap-4">
				<SourceConfiguration />
				<VisualizationsConfig />
				<DataItemsConfig />
			</div>
		</div>
	);
}
