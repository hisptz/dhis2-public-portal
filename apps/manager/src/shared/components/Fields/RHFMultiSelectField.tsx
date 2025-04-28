import {
	MultiSelectField,
	MultiSelectFieldProps,
	MultiSelectOption,
} from "@dhis2/ui";
import React from "react";
import { RegisterOptions, useController } from "react-hook-form";
import { isEmpty } from "lodash";

export type RHFMultiSelectFieldProps = MultiSelectFieldProps & {
	name: string;
	options: { label: string; value: string }[];
	validations?: Omit<
		RegisterOptions,
		"valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
	>;
};

export function RHFMultiSelectField({
	name,
	validations,
	options,
	...props
}: RHFMultiSelectFieldProps) {
	const { field, fieldState } = useController({
		name,
		rules: validations,
	});
	return (
		<MultiSelectField
			{...field}
			selected={isEmpty(options) ? undefined : field.value}
			{...props}
			onChange={({ selected }) => {
				field.onChange(selected);
			}}
			error={!!fieldState.error}
			validationText={fieldState.error?.message}
		>
			{options.map((option) => (
				<MultiSelectOption
					label={option.label}
					key={option.value}
					value={option.value}
				/>
			))}
		</MultiSelectField>
	);
}
