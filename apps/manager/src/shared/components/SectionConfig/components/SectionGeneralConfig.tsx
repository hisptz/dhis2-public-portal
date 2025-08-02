import React from "react";
import { RHFSingleSelectField, RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { useSectionNamePrefix } from "../hooks/route";
import { SectionType } from "@packages/shared/schemas";
import { startCase } from "lodash";

export function SectionGeneralConfig() {
	const namePrefix = useSectionNamePrefix();
	return (
		<div className="flex flex-col gap-6">
			<RHFTextInputField
				required
				name={`${namePrefix}.label`}
				label={i18n.t("Label")}
			/>
			<RHFTextInputField
				name={`${namePrefix}.title`}
				label={i18n.t("Title")}
			/>
			<RHFSingleSelectField
				required
				label={i18n.t("Type")}
				disabled
				placeholder={i18n.t("Select type")}
				options={Object.values(SectionType).map((type) => {
					return {
						label: i18n.t(startCase(type.toLowerCase())),
						value: type,
					};
				})}
				name={`${namePrefix}.type`}
			/>
		</div>
	);
}
