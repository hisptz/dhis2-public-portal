import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import React from "react";
import { useFormContext } from "react-hook-form";
import { AppModule } from "@packages/shared/schemas";
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

	return <VisualizationManager onCancel={onCancel} />;
}
