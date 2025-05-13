import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { StaticConfig } from "../../../../../../../../shared/components/StaticModule/components/StaticConfig/StaticConfig";

export const Route = createFileRoute(
	"/modules/_provider/$moduleId/_formProvider/edit/static/$itemId/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<StaticConfig />
		</div>
	);
}
