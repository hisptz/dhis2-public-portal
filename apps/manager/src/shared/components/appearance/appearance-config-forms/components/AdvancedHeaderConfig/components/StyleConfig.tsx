import React from "react";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { ColorPicker } from "../../ColorPicker";
import { RHFNumberField } from "../../../../../Fields/RHFNumberField";

type Props = {
	label: string;
	parentName: string;
};

export function StyleConfig({ label, parentName }: Props) {
	return (
		<div key={parentName} className="my-4 flex flex-col gap-2">
			<h3 className="text-md font-medium">{label}</h3>
			<div className="mx-2 flex flex-col gap-2">
				<div className="flex flex-wrap gap-2">
					{
						<RHFSingleSelectField
							small
							options={[
								{
									label: i18n.t("Center"),
									value: "center",
								},
								{
									label: i18n.t("Left"),
									value: "left",
								},
								{
									label: i18n.t("Right"),
									value: "right",
								},
							]}
							name={`${parentName}.align`}
							label={i18n.t("Alignment")}
							dataTest={`header-style-align-input-${parentName}`}
						/>
					}
					<RHFNumberField
						small
						name={`${parentName}.textSize`}
						label={i18n.t("Text size")}
						data-test="header-style-text-size-input"
					/>

					<ColorPicker
						name={`${parentName}.textColor`}
						label={i18n.t("Text color")}
						data-test="header-style-text-color-input"
					/>
				</div>
			</div>
		</div>
	);
}
