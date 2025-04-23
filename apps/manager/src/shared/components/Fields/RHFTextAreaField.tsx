import { TextAreaField, TextAreaFieldProps } from "@dhis2/ui";
import React from "react";
import { useController } from "react-hook-form";

interface RHFTransferFieldProps
	extends Omit<TextAreaFieldProps, "onChange" | "value"> {
	name: string;
	label: string;
}

export function RHFTextAreaField({
	name,
	label,
	...rest
}: RHFTransferFieldProps) {
	const { field, fieldState } = useController({
		name,
	});

	return (
		<TextAreaField
			label={label}
			error={!!fieldState.error}
			validationText={fieldState.error?.message}
			{...field}
			onChange={({ value }) => {
				field.onChange(value);
			}}
			{...rest}
		/>
	);
}
