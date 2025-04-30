import { RHFCheckboxField, RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { LibraryGroupConfig } from "./LibraryGroupConfig/LibraryGroupConfig";
import { ItemDisplayConfig } from "./ItemDisplay";

export function GeneralLibraryConfig() {
	return (
		<div className="flex flex-col gap-2">
			<RHFTextInputField required name="label" label={i18n.t("Label")} />
			<RHFTextInputField required name="config.title" label={i18n.t("Title")} />
			<ItemDisplayConfig />
			<RHFCheckboxField
							name="config.grouped"
							label={i18n.t("Has groups")}
						/>
			
			{/* <RHFTextInputField
				name="labelDescription"
				label={i18n.t("Title description")}
			/> */}
			<LibraryGroupConfig />
		</div>
	);
}
