import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { AppModule } from "@packages/shared/schemas";
import { useSaveModule } from "../../../../../../shared/components/ModulesPage/hooks/save";
import { VisualizationManager } from "../../../../../../shared/components/VisualizationModule/components/VisualizationManager";

export const Route = createFileRoute(
	"/modules/_provider/$moduleId/_formProvider/edit/layout",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { moduleId } = useParams({
		from: "/modules/_provider/$moduleId",
	});
	const { resetField } = useFormContext<AppModule>();
	const navigate = useNavigate();
	const { save } = useSaveModule(moduleId);

	const goBack = () => {
		navigate({
			to: "/modules/$moduleId/edit",
			params: { moduleId },
		});
	};

	const onCancel = () => {
		resetField("config.layouts");
		resetField("config.items");
		goBack();
	};

	const onSubmit = async (data: AppModule) => {
		await save(data);
	};

	return <VisualizationManager onCancel={onCancel} onSubmit={onSubmit} />;
}
