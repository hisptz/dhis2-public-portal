import React from "react";
import { useWatch } from "react-hook-form";
import { RHFCheckboxField, RHFSingleSelectField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { ColorPicker } from "../../ColorPicker";
import { RHFNumberField } from "../../../../../Fields/RHFNumberField";

type Props = {
	label: string;
	parentName: string;
};

export function StyleConfig({ label, parentName }: Props) {
	const centred = useWatch({
		name: `${parentName}.center`,
	});

	console.log(`${parentName}.textColor`);
	return (
		<div key={parentName} className="my-4 flex flex-col gap-2">
			<h3 className="text-md font-medium">{label}</h3>
			<div className="mx-2 flex flex-col gap-2">
				<RHFCheckboxField
					name={`${parentName}.center`}
					label={i18n.t("Centered")}
				/>
				<div className="flex flex-wrap gap-2">
					{!centred && (
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
						/>
					)}
					<RHFNumberField
						small
						name={`${parentName}.textSize`}
						label={i18n.t("Text size")}
					/>

					<ColorPicker
						name={`${parentName}.textColor`}
						label={i18n.t("Text color")}
					/>
				</div>
			</div>
		</div>
	);
}
