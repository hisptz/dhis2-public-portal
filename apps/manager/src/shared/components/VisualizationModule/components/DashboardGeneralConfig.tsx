import React, { useEffect } from "react";
import { RHFCheckboxField, RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { RHFRichTextAreaField } from "../../Fields/RHFRichTextAreaField";
import { useFormContext } from "react-hook-form";

export function DashboardGeneralConfig() {
	const { setValue, getValues } = useFormContext();
	useEffect(() => {
		const currentGrouped = getValues("config.grouped");
		if (
			currentGrouped === undefined ||
			currentGrouped === null ||
			currentGrouped === ""
		) {
			setValue("config.grouped", false);
		}
	}, [setValue, getValues]);

	return (
		<div className="flex flex-col gap-2">
			<RHFTextInputField required name="label" label={i18n.t("Label")} />
			<RHFTextInputField
				required
				name="config.title"
				label={i18n.t("Title")}
			/>
			<RHFRichTextAreaField
				required
				autoGrow
				rows={2}
				name="config.shortDescription"
				label={i18n.t("Short description")}
			/>
			<RHFRichTextAreaField
				required
				name="config.description"
				label={i18n.t("Description")}
			/>
			<RHFCheckboxField
				name="config.grouped"
				label={i18n.t("Has groups")}
			/>
		</div>
	);
}
