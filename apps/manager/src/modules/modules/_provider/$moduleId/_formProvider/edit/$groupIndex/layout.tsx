import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { AppModule } from "@packages/shared/schemas";
import { useSaveModule } from "../../../../../../../shared/components/ModulesPage/hooks/save";
import { VisualizationManager } from "../../../../../../../shared/components/VisualizationModule/components/VisualizationManager";

const searchSchema = z.object({
	subGroupIndex: z.number().optional(),
});

export const Route = createFileRoute(
	"/modules/_provider/$moduleId/_formProvider/edit/$groupIndex/layout",
)({
	component: RouteComponent,
	validateSearch: searchSchema,
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
	const { moduleId, groupIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/$groupIndex/layout",
	});
	const { resetField } = useFormContext<AppModule>();
	const navigate = useNavigate();

	const goBack = () => {
		navigate({
			to: "/modules/$moduleId/edit/$groupIndex",
			params: { moduleId, groupIndex },
		});
	};

	const onCancel = () => {
		resetField(`config.groups.${groupIndex}.items`);
		resetField(`config.groups.${groupIndex}.layouts`);
		goBack();
	};

	return (
		<VisualizationManager
			prefix={`config.groups.${groupIndex}`}
			onCancel={onCancel}
		/>
	);
}
