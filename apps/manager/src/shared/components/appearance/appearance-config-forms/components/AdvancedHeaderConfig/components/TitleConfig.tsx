import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";

export function TitleConfig() {
	return (
		<div className="my-2 flex flex-col gap-2">
			<h3 className="text-md font-medium">{i18n.t("Header title")}</h3>
			<div className="mx-2 flex flex-col gap-2">
				<RHFTextInputField
					name={`header.title.text`}
					label={i18n.t("Title")}
					validations={{ required: true }}
				/>
				<RHFTextInputField
					name={`header.subtitle.text`}
					label={i18n.t("Subtitle")}
				/>
			</div>
		</div>
	);
}
