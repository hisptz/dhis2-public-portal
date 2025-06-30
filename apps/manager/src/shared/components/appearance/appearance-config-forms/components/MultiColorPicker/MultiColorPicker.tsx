"use client";

import { useFormContext } from "react-hook-form";
import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, IconAdd16, IconDelete16 } from "@dhis2/ui";
import { ColorSelectorModal } from "./ColorSelectorModal";

type Props = {
	label: string;
	name: string;
	onColorChange?: (colors: string[]) => void;
};

export function MultiColorPicker({ label, name, onColorChange }: Props) {
	const [showColorModal, setShowColorModal] = useState(false);
	const { setValue, getValues } = useFormContext();

	const [tempColors, setTempColors] = useState<string[]>(() => {
		const current = getValues(name);
		return Array.isArray(current) ? current : [];
	});

	const commitColor = (updated: string[]) => {
		setTempColors(updated);
		setValue(name, updated, { shouldValidate: true });
		onColorChange?.(updated);
	};

	const handleTextChange = (index: number, newColor: string) => {
		const updated = [...tempColors];
		updated[index] = newColor;
		setTempColors(updated);
	};

	const handleBlur = (index: number) => {
		commitColor([...tempColors]);
	};

	const handleRemove = (index: number) => {
		const updated = [...tempColors];
		updated.splice(index, 1);
		commitColor(updated);
	};

	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="text-sm font-medium text-gray-700">
					{label}
				</label>
			)}

			<div className="flex flex-wrap gap-4">
				{tempColors.map((color, index) => (
					<div
						key={`${index}-${index}`}
						className="flex items-center gap-2"
					>
						<input
							type="color"
							value={color}
							onChange={(e) =>
								handleTextChange(index, e.target.value)
							}
							onBlur={() => handleBlur(index)}
							className="w-9 h-9 rounded-sm cursor-pointer"
						/>
						<div className="relative">
							<input
								type="text"
								value={color}
								onChange={(e) =>
									handleTextChange(index, e.target.value)
								}
								onBlur={() => handleBlur(index)}
								className="w-24 pl-2 pr-6 py-1 border border-gray-300 rounded-sm !text-sm"
							/>
							<div
								onClick={() => handleRemove(index)}
								className="!absolute right-1 top-1/2 -translate-y-1/2 !p-0 !min-w-0 !h-auto text-gray-600 hover:text-red-600 cursor-pointer"
							>
								<IconDelete16 />
							</div>
						</div>
					</div>
				))}
			</div>

			{tempColors.length === 0 && (
				<span className="text-sm text-gray-500">
					{i18n.t(
						"There are no colors selected. Click the add button to add one.",
					)}
				</span>
			)}

			<div className="w-auto mt-2">
				<Button
					small
					secondary
					onClick={() => setShowColorModal(true)}
					icon={<IconAdd16 />}
				>
					{i18n.t("Add color")}
				</Button>
			</div>

			{showColorModal && (
				<ColorSelectorModal
					onClose={() => setShowColorModal(false)}
					title={i18n.t("Color Selector")}
					onAddColor={(color: string) => {
						const updated = [...tempColors, color];
						commitColor(updated);
						setShowColorModal(false);
					}}
				/>
			)}
		</div>
	);
}
