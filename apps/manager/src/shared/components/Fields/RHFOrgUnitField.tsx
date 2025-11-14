import React from "react";
import { useController, useFormContext } from "react-hook-form";
import { OrgUnitSelectField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";

export interface RHFOrgUnitFieldProps {
	name: string;
	label: string;
	required?: boolean;
	helpText?: string;
	placeholder?: string;
	singleSelection?: boolean;
}

export function RHFOrgUnitField({
	name,
	label,
	required,
	helpText,
	placeholder,
	singleSelection = true,
}: RHFOrgUnitFieldProps) {
	const { control } = useFormContext();
	
	const {
		field: { value, onChange },
		fieldState: { error },
	} = useController({
		name,
		control,
		rules: { required: required ? i18n.t("This field is required") : false },
	});

	return (
		<OrgUnitSelectField
			name={name}
			label={label}
			required={required}
			helpText={helpText}
			placeholder={placeholder || i18n.t("Select organisation unit")}
			singleSelection={singleSelection}
			value={value}
			onChange={onChange}
			error={error?.message}
		/>
	);
}