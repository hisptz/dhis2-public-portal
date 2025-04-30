import { useFormContext } from "react-hook-form";
import { Button, ButtonStrip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useAlert } from "@dhis2/app-runtime";
import { AppModule } from "@packages/shared/schemas";
import { useSaveModule } from "../../ModulesPage/hooks/save";

export function ModuleEditActions() {
	const { moduleId } = useParams({ from: "/modules/_provider/$moduleId" });
	const { save } = useSaveModule(moduleId);
	const { handleSubmit, formState } = useFormContext<AppModule>();
	const navigate = useNavigate();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const onError = () => {
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
				message: i18n.t("Failed to save module", error),
				type: { critical: true },
			});
		}
	};

	return (
		<ButtonStrip end>
			<Button onClick={() => navigate({ to: "/modules" })}>
				{i18n.t("Cancel")}
			</Button>
			<Button
				primary
				loading={formState.isSubmitting}
				disabled={!formState.isDirty || formState.isSubmitting}
				onClick={() => {
					handleSubmit(onSubmit, onError)();
				}}
			>
				{i18n.t("Save changes")}
			</Button>
		</ButtonStrip>
	);
}
