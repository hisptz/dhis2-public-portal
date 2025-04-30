import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { LibraryGroupConfig } from "./LibraryGroupConfig/LibraryGroupConfig";

export function GeneralLibraryConfig() {
	return (
		<div className="flex flex-col gap-2">
			<RHFTextInputField required name="label" label={i18n.t("Title")} />
			<RHFTextInputField
				name="labelDescription"
				label={i18n.t("Title description")}
			/>
			<LibraryGroupConfig />
		</div>
	);
}
