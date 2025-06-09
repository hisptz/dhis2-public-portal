import { RHFCheckboxField, RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import React, { useEffect } from "react";
import { ItemDisplayConfig } from "./ItemDisplay";
import { useFormContext, useWatch } from "react-hook-form";
import { DocumentsModule } from "@packages/shared/schemas";

export function GeneralDocumentConfig() {
	const { setValue, getValues } = useFormContext();
	const moduleId = useWatch({
		name: "id",
	});

	useEffect(() => {
		const currentGrouped = getValues("config.grouped");
		if (
			currentGrouped === undefined ||
			currentGrouped === null ||
			currentGrouped === ""
		) {
			setValue("config.grouped", false);
		}
		if (moduleId) {
			setValue("config.id", "id");
		}
	}, [moduleId, setValue, getValues]);

	return (
		<div className="flex flex-col gap-2">
			<RHFTextInputField required name="label" label={i18n.t("Label")} />
			<RHFTextInputField
				required
				name="config.title"
				label={i18n.t("Title")}
			/>
			<ItemDisplayConfig />
			<RHFCheckboxField
				name="config.grouped"
				helpText={i18n.t(
					"Enable to organize documents into categories or collections. Each group can contain multiple related files."
				)}
				label={i18n.t("Has groups")}
			/>
		</div>
	);
}
