import { CheckboxField } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React, { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DocumentGroup } from "@packages/shared/schemas";
import { SubGroupsListForm } from "./SubGroupsListForm/SubGroupsListForm";
import { FilesListForm } from "./FilesListForm/FilesListForm";

export function LibraryGroupTypeSelector({ nested }: { nested?: boolean }) {
	const { setValue } = useFormContext();
	// const value = useWatch<DocumentGroup, "subGroups">({
	// 	name: "subGroups",
	// });
	// const checked = useMemo(() => Array.isArray(value), [value]);

	if (nested) {
		return <FilesListForm nested />;
	}

	return (
		<>
			<CheckboxField
				onChange={({ checked }) => {
					if (checked) {
						setValue("subGroups", []);
						setValue("files", undefined);
					} else {
						setValue("subGroups", undefined);
						setValue("files", []);
					}
				}}
				// checked={checked}
				label={i18n.t("Has sub groups")}
			/>
			{/* {checked && <SubGroupsListForm />} */}
			{/* {!checked && <FilesListForm />} */}
		</>
	);
}
