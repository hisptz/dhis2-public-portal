import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Field, FieldProps, FileInput } from "@dhis2/ui";
import { useController } from "react-hook-form";
import { AppIconFile } from "@packages/shared/schemas";
import { useConfig } from "@dhis2/app-runtime";

export function RHFIconInput({
	name,
	label,
	accept,
	...props
}: { name: string; label: string; accept?: "png" | "svg" } & FieldProps) {
	const config = useConfig();
	const { field, fieldState } = useController({
		name,
	});
	 
	return (
		<Field
			{...props}
			error={!!fieldState.error}
			validationText={fieldState.error?.message}
			required
			label={label}
		>
			{field.value && (
				<div className="aspect-square w-[100px] p-2 flex justify-center items-center">
					<img
						alt={"icon"}
						src={
							field.value.id
								? `${config.baseUrl}/api/documents/${field.value.id}/data`
								: `${window.URL.createObjectURL(field.value)}`
						}
					/>
				</div>
			)}
			<FileInput
				/*
	  // @ts-expect-error @dhis2/ui errors */
				files={[field.value]}
				buttonLabel={i18n.t("Upload Icon")}
				onChange={async ({ files }) => {
					const file = files.item(0);
					if (file) {
						field.onChange(await AppIconFile.fromFile(file));
					} else {
						field.onChange(null);
					}
				}}
				accept={accept ? (accept === "svg" ? "image/svg+xml" : "image/png") : undefined}
				name={name}
			/>
		</Field>
	);
}
