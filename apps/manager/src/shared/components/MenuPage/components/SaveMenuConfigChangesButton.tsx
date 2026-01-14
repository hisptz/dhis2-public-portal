import { useFormContext, useFormState } from "react-hook-form";
import { AppMenuConfig } from "@packages/shared/schemas";
import { Button, ButtonStrip } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useSaveMenuConfig } from "../hooks/data";
import React from "react";
import { useDialog } from "@hisptz/dhis2-ui";
import { useAlert } from "@dhis2/app-runtime";

export function SaveMenuConfigChangesButton() {
	const { isSubmitting, isDirty } = useFormState<AppMenuConfig>();
	const { save } = useSaveMenuConfig();
	const { handleSubmit, reset } = useFormContext<AppMenuConfig>();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const onError = (errors) => {
		console.error(errors);
		show({
			message: i18n.t(
				"The form has errors. Please fix them and try again",
			),
			type: { critical: true },
		});
	};

	const { confirm } = useDialog();

	return (
		<ButtonStrip>
			<Button
				onClick={() => {
					confirm({
						title: i18n.t("Confirm reset"),
						message: i18n.t(
							"Are you sure you want to reset all changes? This action is not reversible.",
						),
						onConfirm: () => {
							reset();
						},
						confirmButtonColor: "primary",
						confirmButtonText: i18n.t("Reset changes"),
					});
				}}
				disabled={!isDirty}
			>
				{i18n.t("Reset")}
			</Button>
			<Button
				dataTest="save-menu-config-changes-button"
				loading={isSubmitting}
				primary
				disabled={!isDirty}
				onClick={(_, e) => {
					handleSubmit(save, onError)(e);
				}}
			>
				{isSubmitting ? i18n.t("Saving...") : i18n.t("Save changes")}
			</Button>
		</ButtonStrip>
	);
}
