import React from "react";
import { RHFSingleSelectField, RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { SectionDisplay } from "@packages/shared/schemas";
import { startCase } from "lodash";

export function SectionModuleGeneralConfig() {
	return (
		<div className="flex flex-col gap-2">
			<RHFTextInputField required name="label" label={i18n.t("Label")} />
			<RHFSingleSelectField
				required
				label={i18n.t("Display type")}
				placeholder={i18n.t("Select display type")}
				options={Object.values(SectionDisplay).map((type) => {
					return {
						label: i18n.t(startCase(type.toLowerCase())),
						value: type,
					};
				})}
				name="sectionDisplay"
			/>
		</div>
	);
}
