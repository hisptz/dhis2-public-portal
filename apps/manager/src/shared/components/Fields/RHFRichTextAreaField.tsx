import React from "react";
import { useController } from "react-hook-form";
import { RichTextEditor, RichTextEditorProps } from "@hisptz/dhis2-ui";

interface RHFRichTextAreaFieldProps
	extends Omit<RichTextEditorProps, "onChange" | "value"> {
	name: string;
	label: string;
}

export function RHFRichTextAreaField({
	name,
	label,
	...rest
}: RHFRichTextAreaFieldProps) {
	const { field, fieldState } = useController({
		name,
	});

	return (
		<RichTextEditor
			config={{}}
			label={label}
			error={!!fieldState.error}
			validationText={fieldState.error?.message}
			{...field}
			{...rest}
		/>
	);
}
