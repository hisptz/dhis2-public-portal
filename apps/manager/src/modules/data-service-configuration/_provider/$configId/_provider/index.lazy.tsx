import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { useWatch } from "react-hook-form";
import { DataServiceConfig } from "@packages/shared/schemas";
import { SourceConfiguration } from "../../../../../shared/components/DataConfiguration/components/SourceConfiguration";
import { DataItemsConfig } from "../../../../../shared/components/DataConfiguration/components/DataItemsConfig/DataItemsConfig";
import { Button, IconArrowLeft24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

export const Route = createLazyFileRoute(
	"/data-service-configuration/_provider/$configId/_provider/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const source = useWatch<DataServiceConfig, "source">({
		name: "source",
	});

	const navigate = useNavigate({
		from: "/data-service-configuration/$configId",
	});

	return (
		<div className="h-full w-full flex flex-col gap-4 ">
			<div className="pb-2">
				<Button
					onClick={() => {
						navigate({
							to: "/data-service-configuration",
						});
					}}
					icon={<IconArrowLeft24 />}
				>
					{i18n.t("Back")}
				</Button>
			</div>
			<div className="flex-1 flex flex-col gap-4">
				<SourceConfiguration />
				<DataItemsConfig />
			</div>
		</div>
	);
}
