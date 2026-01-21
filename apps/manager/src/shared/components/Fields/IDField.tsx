import { useFormContext, useWatch } from "react-hook-form";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import React, { useEffect } from "react";
import { kebabCase } from "lodash";

export function RHFIDField({
	name,
	dependsOn,
	label,
	disabled,
}: {
	name: string;
	dependsOn: string;
	label: string;
	disabled?: boolean;
}) {
	const { setValue } = useFormContext();
	const title = useWatch({
		name: dependsOn,
	});

	useEffect(() => {
		if (title) {
			setValue(name, kebabCase(title.toLowerCase()));
		}
	}, [title]);

	return (
		<RHFTextInputField
			required
			helpText={i18n.t(
				"This will be a part of the url. It should not contain spaces",
			)}
			disabled = {!!disabled}
			name={name}
			label={label}
		/>
	);
}
