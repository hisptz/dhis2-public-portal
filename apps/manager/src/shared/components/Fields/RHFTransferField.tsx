import { Field, Transfer, TransferProps } from "@dhis2/ui";
import React from "react";
import { useController } from "react-hook-form";

interface RHFTransferFieldProps
	extends Omit<TransferProps, "onChange" | "selected"> {
	name: string;
	label: string;
}

export function RHFTransferField({
	name,
	label,
	...rest
}: RHFTransferFieldProps) {
	const { field, fieldState } = useController({
		name,
	});

	return (
		<Field
			label={label}
			error={!!fieldState.error}
			validationText={fieldState.error?.message}
			{...field}
		>
			<Transfer
				{...rest}
				selected={field.value}
				onChange={({ selected }) => {
					field.onChange(selected);
				}}
			/>
		</Field>
	);
}
