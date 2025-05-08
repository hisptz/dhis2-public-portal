import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFCheckboxField } from "@hisptz/dhis2-ui";
import { ColorPicker } from "../../ColorPicker";
import { RHFNumberField } from "../../../../../Fields/RHFNumberField";
import { useWatch } from "react-hook-form";
import { AppearanceConfigFormData } from "../../../HeaderConfigForm";

const STYLE_KEY = "header.style";

function BackgroundColorConfig() {
	const backgroundIsPrimaryColor = useWatch<
		AppearanceConfigFormData,
		"header.style.usePrimaryColorAsBackgroundColor"
	>({
		name: "header.style.usePrimaryColorAsBackgroundColor",
	});

	if (backgroundIsPrimaryColor) {
		return null;
	}

	return (
		<ColorPicker
			name={`${STYLE_KEY}.headerBackgroundColor`}
			label={i18n.t("Background Color")}
		/>
	);
}

function BackgroundConfig() {
	const coloredBackground = useWatch<
		AppearanceConfigFormData,
		"header.style.coloredBackground"
	>({
		name: "header.style.coloredBackground",
	});

	if (!coloredBackground) {
		return null;
	}

	return (
		<>
			<RHFCheckboxField
				name={`${STYLE_KEY}.usePrimaryColorAsBackgroundColor`}
				label={i18n.t("Use primary color as background color")}
			/>
			<BackgroundColorConfig />
		</>
	);
}

export function HeaderStyleConfig() {
	return (
		<div className="my-4 flex flex-col gap-2">
			<h3 className="text-md font-medium">{i18n.t("Header styles")}</h3>
			<div className="mx-2 flex flex-col gap-2">
				<RHFCheckboxField
					name={`${STYLE_KEY}.coloredBackground`}
					label={i18n.t("Show colored background")}
				/>
				<BackgroundConfig />
				<div className="w-[35%]">
					<RHFNumberField
						name={`${STYLE_KEY}.containerHeight`}
						label={i18n.t("Header height")}
					/>
				</div>
			</div>
		</div>
	);
}
