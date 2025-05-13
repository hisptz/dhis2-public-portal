import { Button, ButtonStrip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useSaveModule } from "../../ModulesPage/hooks/save";
import { useFormContext } from "react-hook-form";
import { AppModule } from "@packages/shared/schemas";
import { useAlert } from "@dhis2/app-runtime";
import { useDialog } from "@hisptz/dhis2-ui";
import { useSectionNamePrefix } from "../../SectionConfig/hooks/route";

export function SectionEditActions() {
	const { resetField, getFieldState } = useFormContext();
	const namePrefix = useSectionNamePrefix();
	const { confirm } = useDialog();
	const navigate = useNavigate({
		from: "/modules/$moduleId/edit/section/$sectionIndex",
	});

	const { moduleId } = useParams({ from: "/modules/_provider/$moduleId" });
	const { save } = useSaveModule(moduleId);
	const { handleSubmit, formState, reset, getValues } =
		useFormContext<AppModule>();
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
			const newValues = getValues();
			await save(data);
			reset(newValues);
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
					const fieldState = getFieldState(namePrefix);
					if (fieldState.isDirty) {
						confirm({
							title: i18n.t("Confirm reset"),
							message: i18n.t(
								"There were changes made to this section. Would you like to reset them? Resetting will remove all changes made to this section. This action is not reversible.",
							),
							onCancel: () => {
								navigate({
									to: "/modules/$moduleId/edit",
									params: { moduleId },
								});
							},
							onConfirm: () => {
								resetField(namePrefix);
								navigate({
									to: "/modules/$moduleId/edit",
									params: { moduleId },
								});
							},
							confirmButtonText: i18n.t("Reset changes"),
							cancelButtonText: i18n.t("Keep changes"),
							confirmButtonColor: "primary",
						});
					} else {
						navigate({
							to: "/modules/$moduleId/edit",
							params: { moduleId },
						});
					}
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
				}}
			>
				{i18n.t("Save section changes")}
			</Button>
		</ButtonStrip>
	);
}
