import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { RHFTextAreaField } from "../../Fields/RHFTextAreaField";
import React from "react";
import { RHFIconInput } from "../../Fields/RHFIconInput";

export function GeneralForm() {
	return (
		<div className="flex flex-col gap-2">
			<RHFTextInputField label={i18n.t("Application name")} name="name" />
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
			<RHFIconInput
				helpText={i18n.t("A 512px by 512px image is recommended")}
				label={i18n.t("Application Icon")}
				accept="image/*"
				name="icon"
			/>
		</div>
	);
}
