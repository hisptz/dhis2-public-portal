import React from "react";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { ModuleType } from "@packages/shared/schemas";

export function ModuleTypeSelector(){
	return (
		<div className="flex flex-col gap-2">
			<RHFSingleSelectField
				label={i18n.t("Type")}
				defaultValue={ModuleType.VISUALIZATION}
				placeholder={i18n.t("Select type")}
				options={[
					{
						label: i18n.t("VISUALIZATION"),
						value: ModuleType.VISUALIZATION,
					},
					{
						label: i18n.t("DOCUMENTS"),
						value: ModuleType.DOCUMENTS,
					},
					{
						label: i18n.t("SECTION"),
						value: ModuleType.SECTION,
					},
					{
						label: i18n.t("STATIC"),
						value: ModuleType.STATIC,
					},
				]}
				name="type"
			/>
		</div>
	);
};
