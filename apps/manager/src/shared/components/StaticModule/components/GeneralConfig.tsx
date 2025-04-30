import React, { useEffect } from "react";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { useFormContext, useWatch } from "react-hook-form";

export function GeneralConfig() {
	const { setValue } = useFormContext();
	const moduleId = useWatch({
		name: "id",
	});

	useEffect(() => {
		if (moduleId) {
			setValue("config.namespace", `health-portal-${moduleId}`);
		}
	}, [moduleId, setValue]);

	return (
		<div className="flex flex-col gap-2">
			<RHFTextInputField required name="label" label={i18n.t("Label")} />
			<RHFTextInputField
				required
				name="config.title"
				label={i18n.t("Title")}
			/>
		</div>
	);
}
