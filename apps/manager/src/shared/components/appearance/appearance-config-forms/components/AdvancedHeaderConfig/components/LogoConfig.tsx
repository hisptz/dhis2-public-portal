import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { RHFNumberField } from "../../../../../Fields/RHFNumberField";

type Props = {
	logoType: string;
	label: string;
};

export function LogoConfig({ logoType, label }: Props) {
	const STYLE_KEY = "header.style";

	return (
		<div className="my-2 flex flex-col gap-2">
			<h3 className="text-md font-medium">{label}</h3>
			<div className="mx-2 flex flex-col gap-2">
				<RHFTextInputField
					name={`${STYLE_KEY}.${logoType}.url`}
					type="url"
					label={i18n.t("Logo url")}
				/>
				<div className="flex flex-row gap-1">
					<RHFNumberField
						name={`${STYLE_KEY}.${logoType}.width`}
						label={i18n.t("Width")}
					/>
					<RHFNumberField
						name={`${STYLE_KEY}.${logoType}.height`}
						label={i18n.t("Height")}
					/>
				</div>
			</div>
		</div>
	);
}
