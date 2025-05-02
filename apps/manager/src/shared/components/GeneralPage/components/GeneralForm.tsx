import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { RHFTextAreaField } from "../../Fields/RHFTextAreaField";
import React from "react";
import { IconInput } from "./IconInput";

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
			<IconInput />
		</div>
	);
}
