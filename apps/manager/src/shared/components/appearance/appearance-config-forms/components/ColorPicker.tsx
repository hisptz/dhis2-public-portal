import React from "react";
import { useFormContext } from "react-hook-form";

type ColorPickerProps = {
	name: string;
	label?: string;
};

export function ColorPicker({ name, label }: ColorPickerProps) {
	const {
		register,
		watch,
		formState: { errors },
	} = useFormContext();

	const value = watch(name);

	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="text-sm font-medium text-gray-700">
					{label}
				</label>
			)}
			<div className="flex items-center gap-2">
				<input
					type="color"
					{...register(name)}
					defaultValue="#000000"
					className="w-8 h-8 p-0 border-1 border-gray-300 rounded-sm cursor-pointer"
				/>
				<span className="text-sm text-gray-700">{value}</span>
			</div>
			{errors[name] && (
				<span className="text-sm text-red-500">
					{(errors[name] as { message?: string })?.message}
				</span>
			)}
		</div>
	);
}
