import React from "react";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { RHFTextAreaField } from "./Fields/RHFTextAreaField";
import { RHFRichTextAreaField } from "./Fields/RHFRichTextAreaField";


export function StaticForm() {
	return (
		<form className="h-full w-full gap-4 flex flex-col">
			<RHFTextInputField required name="title" label={i18n.t("Title")} />
			<RHFTextAreaField
				required
				autoGrow
				rows={2}
				name="shortDescription"
				label={i18n.t("Short Description")}
			/>
			<RHFRichTextAreaField
				required
				name="content"
				label={i18n.t("Content")}
			/>
			<RHFTextAreaField
				required
				autoGrow
				rows={2}
				name="icon"
				helpText={i18n.t("Should be a valid svg string")}
				label={i18n.t("Icon")}
			/>
		</form>
	);
}
