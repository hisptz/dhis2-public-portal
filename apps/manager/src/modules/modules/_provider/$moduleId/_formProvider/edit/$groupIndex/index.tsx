import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { GroupConfigPage } from "../../../../../../../shared/components/GroupConfig/GroupConfigPage";

export const Route = createFileRoute(
	"/modules/_provider/$moduleId/_formProvider/edit/$groupIndex/",
)({
	component: RouteComponent,
	params: {
		parse: (rawParams) => {
			return {
				...rawParams,
				groupIndex: parseInt(rawParams.groupIndex),
			};
		},
		stringify: (params) => {
			return {
				...params,
				groupIndex: params.groupIndex.toString(),
			};
		},
	},
});

function RouteComponent() {
	return <GroupConfigPage />;
}
