import React from "react";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { ModuleType } from "@packages/shared/schemas";
import { startCase } from "lodash";

export function ModuleTypeSelector() {
	return (
		<div className="flex flex-col gap-2">
			<RHFSingleSelectField
				dataTest={"add-module-type"}
				label={i18n.t("Type")}
				required
				defaultValue={ModuleType.VISUALIZATION}
				placeholder={i18n.t("Select type")}
				options={Object.values(ModuleType).map((module) => ({
					label: startCase(module.toLowerCase()),
					value: module,
				}))}
				name="type"
			/>
		</div>
	);
}
