import React, { useState } from "react";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

type Props = {
	title: string;
	onClose: () => void;
	onAddColor: (color: string) => void;
};

export function ColorSelectorModal({ onClose, onAddColor, title }: Props) {
	const [color, setColor] = useState<string | undefined>("#000000");

	return (
		<Modal position="middle" small>
			<ModalTitle>{title}</ModalTitle>
			<ModalContent>
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-gray-700">
						{i18n.t("Color")}
					</label>

					<div className="flex items-center gap-2">
						<input
							type="color"
							defaultValue={color}
							onChange={(e) => setColor(e.target.value)}
							className="w-8 h-8 p-0 border-1 border-gray-300 rounded-sm cursor-pointer"
						/>
						<input
							type="text"
							value={color}
							onChange={(e) => setColor(e.target.value)}
							className="w-24 px-2 py-1 border border-gray-300 rounded-sm !text-sm"
						/>
					</div>
				</div>
			</ModalContent>
			<ModalActions>
				<ButtonStrip end>
					<Button secondary onClick={onClose}>
						{i18n.t("Cancel")}
					</Button>
					<Button
						primary
						onClick={() => onAddColor(color ?? "#000000")}
					>
						{i18n.t("Add")}
					</Button>
				</ButtonStrip>
			</ModalActions>
		</Modal>
	);
}
