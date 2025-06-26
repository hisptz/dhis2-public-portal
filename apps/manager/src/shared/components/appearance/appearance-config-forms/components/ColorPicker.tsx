import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@dhis2/ui";

type ColorPickerProps = {
	name: string;
	label?: string;
};

export function ColorPicker({ name, label }: ColorPickerProps) {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext();

	const value = watch(name);

	const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(name, e.target.value, { shouldValidate: true });
	};

	const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(name, e.target.value);
	};

	return (
		<div className="flex flex-col gap-1">
			{label && <Label>{label}</Label>}
			<div className="flex items-center gap-2">
				<input
					type="color"
					{...register(name)}
					defaultValue="#000000"
					value={value}
					onChange={handleColorInputChange}
					style={{ borderRadius: "50% !important" }}
					className="w-9 h-9 rounded-sm cursor-pointer"
				/>
				<input
					type="text"
					className="w-24 px-2 py-1 border border-gray-300 rounded-sm !text-sm"
					value={value || ""}
					onChange={handleTextInputChange}
				/>
			</div>
			{errors[name] && (
				<span className="!text-sm text-red-500">
					{(errors[name] as { message?: string })?.message}
				</span>
			)}
		</div>
	);
}
