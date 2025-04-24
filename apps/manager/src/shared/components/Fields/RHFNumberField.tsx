import { InputField, InputFieldProps } from "@dhis2/ui";
// import { RHFFieldProps } from "@hisptz/dhis2-ui/dist/types/forms/interfaces";
import React from "react";
import { useController } from "react-hook-form";
import { RHFFieldProps } from "../../interfaces/interface";

export type RHFNumberFieldProps = InputFieldProps & RHFFieldProps & {};

export function RHFNumberField({
	name,
	validations,
	...props
}: RHFNumberFieldProps) {
	const { field, fieldState } = useController({
		name,
		rules: validations,
	});

	return (
		<InputField
			{...field}
			ref={field.ref}
			error={!!fieldState.error}
			validationText={fieldState.error?.message}
			value={field.value?.toString()}
			onChange={({ value }) => {
				if (value) {
					field.onChange(+value);
				} else {
					field.onChange(null);
				}
			}}
			type="number"
			{...props}
		/>
	);
}
