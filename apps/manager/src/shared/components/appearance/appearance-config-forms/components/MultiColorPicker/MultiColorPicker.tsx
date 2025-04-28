import { useFormContext, useWatch } from "react-hook-form";
import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, IconAdd16 } from "@dhis2/ui";
import { ColorSelectorModal } from "./ColorSelectorModal";

type Props = {
	label: string;
	name: string;
	onColorChange?: (colors: string[]) => void;
};

export function MultiColorPicker({ label, name, onColorChange }: Props) {
	const [showColorModal, setShowColorModal] = useState(false);
	const colors: string[] = useWatch({
		name,
	});
	const { setValue } = useFormContext();

	const handleChange = (index: number, color: string) => {
		let newColors = [...colors];
		newColors[index] = color;
		setValue(name, newColors);
	};

	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="text-sm font-medium text-gray-700">
					{label}
				</label>
			)}
			<div className="flex flex-row flex-wrap items-center gap-2">
				{colors.map((color, index) => (
					<input
						key={`${index}-${color}`}
						type="color"
						defaultValue={color}
						onBlur={(e) => handleChange(index, e.target.value)}
						className="w-8 h-8 p-0 border-1 border-gray-300 rounded-sm cursor-pointer"
					/>
				))}
			</div>
			{(colors ?? []).length === 0 && (
				<span className="text-sm text-gray-500">
					{i18n.t(
						"There are colors selected. Click the add button to add one.",
					)}
				</span>
			)}

			<div className="w-auto">
				<Button
					small
					secondary
					onClick={() => setShowColorModal(true)}
					icon={<IconAdd16 />}
				>
					{i18n.t("Add color")}
				</Button>
			</div>

			{/* Color modal */}
			{showColorModal && (
				<ColorSelectorModal
					onClose={() => setShowColorModal(false)}
					title={i18n.t("Color Selector")}
					onAddColor={(color: string) => {
						colors.push(color);
						setShowColorModal(false);
					}}
				/>
			)}
		</div>
	);
}
