import { TextInput } from "@mantine/core";
import { useController } from "react-hook-form";

interface RHFTextFieldProps {
	name: string;
	label?: string;
	placeholder?: string;
	description?: string;
	size?: string;
	disabled?: boolean;
	required?: boolean;
	[key: string]: any;
}

export function RHFTextField({ name, ...props }: RHFTextFieldProps) {
	const { field, fieldState } = useController({
		name,
	});

	return (
		<TextInput
			{...field}
			error={fieldState.error?.message}
			{...props}
		/>
	);
}
