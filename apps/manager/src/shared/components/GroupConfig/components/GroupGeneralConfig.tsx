import React from "react";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { useGroupNamePrefix } from "../hooks/route";
import { RHFRichTextAreaField } from "../../Fields/RHFRichTextAreaField";

export function GroupGeneralConfig() {
	const namePrefix = useGroupNamePrefix();
	return (
		<div className="flex flex-col gap-6">
			<RHFTextInputField
				required
				name={`${namePrefix}.title`}
				label={i18n.t("Title")}
			/>
			<RHFTextInputField
				required
				name={`${namePrefix}.shortName`}
				label={i18n.t("Short name")}
			/>
			<RHFRichTextAreaField
				autoGrow
				rows={2}
				name={`${namePrefix}.shortDescription`}
				label={i18n.t("Short description")}
			/>
			<RHFRichTextAreaField
				name={`${namePrefix}.description`}
				label={i18n.t("Description")}
			/>
		</div>
	);
}
