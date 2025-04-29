import { createLazyFileRoute } from "@tanstack/react-router";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { ModuleContainer } from "../../../shared/components/ModuleContainer";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { RHFTextAreaField } from "../../../shared/components/Fields/RHFTextAreaField";
import { Button, ButtonStrip } from "@dhis2/ui";
import { useFormContext, useFormState } from "react-hook-form";
import { useSaveMetadata } from "../../../shared/components/GeneralPage/hooks/data";

export const Route = createLazyFileRoute("/general/_provider/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isDirty, isSubmitting } = useFormState();
	const { handleSubmit } = useFormContext();

	const { save } = useSaveMetadata();

	return (
		<ModuleContainer title={i18n.t("General configuration")}>
			<div className="w-full h-full flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<RHFTextInputField
						label={i18n.t("Application name")}
						name="name"
					/>
					<RHFTextAreaField
						label={i18n.t("Description")}
						name="description"
					/>
					<RHFTextInputField
						placeholder={"https://example.org/portal"}
						label={i18n.t("Application URL")}
						helpText={i18n.t("Where your portal can be found")}
						name="applicationURL"
					/>
				</div>
				<ButtonStrip>
					<Button
						loading={isSubmitting}
						onClick={() => {
							handleSubmit(save)();
						}}
						disabled={!isDirty}
						primary
					>
						{isSubmitting
							? i18n.t("Saving...")
							: i18n.t("Save changes")}
					</Button>
				</ButtonStrip>
			</div>
		</ModuleContainer>
	);
}
