import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { SectionConfigPage } from "../../../../../../../../shared/components/SectionConfig/SectionConfigPage";

export const Route = createFileRoute(
	"/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/",
)({
	component: RouteComponent,
	params: {
		parse: (rawParams) => {
			return {
				...rawParams,
				sectionIndex: parseInt(rawParams.sectionIndex),
			};
		},
		stringify: (params) => {
			return {
				...params,
				sectionIndex: params.sectionIndex.toString(),
			};
		},
	},
});

function RouteComponent() {
	return <SectionConfigPage />;
}
