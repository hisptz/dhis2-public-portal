import { createLazyFileRoute } from "@tanstack/react-router";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { ModuleContainer } from "../../../shared/components/ModuleContainer";
import { Button, ButtonStrip } from "@dhis2/ui";
import { useFormContext, useFormState } from "react-hook-form";
import { useSaveMetadata } from "../../../shared/components/GeneralPage/hooks/data";
import { GeneralForm } from "../../../shared/components/GeneralPage/components/GeneralForm";

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
				<GeneralForm />
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
