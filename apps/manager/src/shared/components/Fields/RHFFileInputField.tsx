import { FileInputField, FileInputFieldProps, FileListItem } from "@dhis2/ui";
import React from "react";
import { useController } from "react-hook-form";

export interface RHFFileInputFieldProps
	extends Omit<
		FileInputFieldProps,
		"onChange" | "value" | "validationText" | "error" | "onBlur"
	> {
	name: string;
	label: string;
}

export function RHFFileInputField({
	name,
	label,
	...props
}: RHFFileInputFieldProps) {
	const { field, fieldState } = useController({
		name,
	});

	return (
		<FileInputField
			{...props}
			{...field}
			error={!!fieldState.error}
			validationText={fieldState.error?.message}
			onChange={({ files }) => {
				field.onChange(files.item(0));
			}}
			label={label}
		>
			{field.value && (
				<FileListItem
					label={field.value.name}
					onRemove={() => {
						field.onChange(undefined);
					}}
				/>
			)}
		</FileInputField>
	);
}
