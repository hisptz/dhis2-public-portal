import { useFormContext, useWatch } from "react-hook-form";
import { LibraryData } from "@packages/shared/schemas";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import React, { useEffect } from "react";
import { kebabCase } from "lodash";

export function LibraryIDField() {
	const { setValue } = useFormContext<LibraryData>();
	const title = useWatch<LibraryData, "label">({
		name: "label",
	});

	useEffect(() => {
		if (title) {
			setValue("id", kebabCase(title.toLowerCase()));
		}
	}, [title]);

	return (
		<RHFTextInputField
			required
			helpText={i18n.t(
				"This will be a part of the url. It should not contain spaces",
			)}
			name="id"
			label={i18n.t("ID")}
		/>
	);
}
