import { useFormContext, useWatch } from "react-hook-form";
import { MenuItem } from "@packages/shared/schemas";
import React, { useEffect } from "react";
import { kebabCase } from "lodash";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";

export function MenuPathInput() {
	const { setValue } = useFormContext();
	const label = useWatch<MenuItem, "label">({
		name: "label",
	});

	useEffect(() => {
		if (label) {
			if (label.length <= 50) {
				setValue("path", kebabCase(label.toLowerCase()));
			} else {
				const path = label.substring(0, 50);
				setValue("path", kebabCase(path.toLowerCase()));
			}
		}
	}, [label, setValue]);

	return (
		<RHFTextInputField
			disabled
			required
			name="path"
			label={i18n.t("Path")}
		/>
	);
}
