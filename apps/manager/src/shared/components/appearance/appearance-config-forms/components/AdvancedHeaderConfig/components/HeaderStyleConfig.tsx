import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFCheckboxField } from "@hisptz/dhis2-ui";
import { ColorPicker } from "../../ColorPicker";
import { RHFNumberField } from "../../../../../Fields/RHFNumberField";

export function HeaderStyleConfig() {
	const STYLE_KEY = "style";
	return (
		<div className="my-4 flex flex-col gap-2">
			<h3 className="text-md font-medium">{i18n.t("Header styles")}</h3>
			<div className="mx-2 flex flex-col gap-2">
				<RHFCheckboxField
					name={`${STYLE_KEY}.coloredBackground`}
					label={i18n.t("Show colored background")}
				/>
				<ColorPicker
					name={`${STYLE_KEY}.headerBackgroundColor`}
					label={i18n.t("Background Color")}
				/>
				<div className="w-[35%]">
					<RHFNumberField
						name="style.containerHeight"
						label={i18n.t("Header height")}
					/>
				</div>
			</div>
		</div>
	);
}
