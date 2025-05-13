import { Button, ButtonStrip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useSaveModule } from "../../ModulesPage/hooks/save";
import { useFormContext } from "react-hook-form";
import { AppModule } from "@packages/shared/schemas";
import { useAlert } from "@dhis2/app-runtime";

export function DashboardGroupEditActions() {
	const navigate = useNavigate({
		from: "/modules/$moduleId/edit/$groupIndex",
	});

	const { moduleId } = useParams({ from: "/modules/_provider/$moduleId" });
		const { save } = useSaveModule(moduleId);
		const { handleSubmit, formState } = useFormContext<AppModule>();
		const { show } = useAlert(
			({ message }) => message,
			({ type }) => ({ ...type, duration: 3000 }),
		);
	
		const onError = (e) => {
			console.log(e);
			show({
				message: i18n.t("Please fix the validation errors before saving"),
				type: { critical: true },
			});
		};
	
		const onSubmit = async (data: AppModule) => {
			try {
				await save(data);
			} catch (error) {
				show({
					message: i18n.t("Failed to save section", error),
					type: { critical: true },
				});
			}
		};

	return (
		<ButtonStrip end>
			<Button
				onClick={() => {
					navigate({
						to: "/modules",
					});
				}}
			>
				{i18n.t("Cancel")}
			</Button>
			<Button
				primary
				loading={formState.isSubmitting}
				disabled={!formState.isDirty || formState.isSubmitting}
				onClick={() => {
					handleSubmit(onSubmit, onError)();
					navigate({
						to: "/modules/$moduleId/edit",
					});
				}}
			>
				{i18n.t("Save group changes")}
			</Button>
		</ButtonStrip>
	);
}
