import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFCheckboxField } from "@hisptz/dhis2-ui";
import { useWatch } from "react-hook-form";
import { ColorPicker } from "../../components/ColorPicker";
import { FooterConfig } from "@packages/shared/schemas";

function BackgroundColorConfig() {
	const backgroundIsPrimaryColor = useWatch<
		FooterConfig,
		"usePrimaryColorAsBackgroundColor"
	>({
		name: "usePrimaryColorAsBackgroundColor",
	});

	if (backgroundIsPrimaryColor) {
		return null;
	}

	return (
		<ColorPicker
			name={`footerBackgroundColor`}
			label={i18n.t("Background Color")}
		/>
	);
}

function BackgroundConfig() {
	const coloredBackground = useWatch<FooterConfig, "coloredBackground">({
		name: "coloredBackground",
	});

	if (!coloredBackground) {
		return null;
	}

	return (
		<>
			<RHFCheckboxField
				name={`usePrimaryColorAsBackgroundColor`}
				label={i18n.t("Use primary color as background color")}
			/>
			<BackgroundColorConfig />
		</>
	);
}

export function FooterStyleConfig() {
	return (
		<div className="my-4 flex flex-col gap-2">
			<h3 className="text-md font-medium">{i18n.t("Footer styles")}</h3>
			<div className="mx-2 flex flex-col gap-2">
				<RHFCheckboxField
					name={`coloredBackground`}
					label={i18n.t("Show colored background")}
				/>
				<BackgroundConfig />
			</div>
		</div>
	);
}
