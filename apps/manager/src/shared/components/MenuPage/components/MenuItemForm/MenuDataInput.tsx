import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { AppModule, ModuleMenuItem } from "@packages/shared/schemas";
import { useGetDatastoreEntries } from "../../../../hooks/datastore";
import { DatastoreNamespaces } from "@packages/shared/constants";

export function MenuDataInput() {
	const { setValue } = useFormContext<ModuleMenuItem>();
	const { data } = useGetDatastoreEntries<AppModule>({
		namespace: DatastoreNamespaces.MODULES,
		fields: ["id", "label", "type"],
	});
	const moduleId = useWatch<ModuleMenuItem, "moduleId">({
		name: "moduleId",
	});

	useEffect(() => {
		if (data && moduleId) {
			const selectedModule = data.find((item) => item.id === moduleId);
			if (selectedModule) {
				setValue("label", selectedModule.label);
			}
			setValue("path", `${moduleId}`);
		}
	}, [data, moduleId, setValue]);

	return (
		<>
			<RHFTextInputField
				disabled
				required
				name="label"
				label={i18n.t("Label")}
			/>
			<RHFTextInputField
				disabled
				required
				name="path"
				label={i18n.t("Path")}
			/>
		</>
	);
}
