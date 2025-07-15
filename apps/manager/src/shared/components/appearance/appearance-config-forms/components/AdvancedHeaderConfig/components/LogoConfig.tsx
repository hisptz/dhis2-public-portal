import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFCheckboxField } from "@hisptz/dhis2-ui";
import { RHFNumberField } from "../../../../../Fields/RHFNumberField";
import { useWatch } from "react-hook-form";
import { RHFIconInput } from "../../../../../Fields/RHFIconInput";

type Props = {
	logoType: string;
	label: string;
};

export function LogoConfig({ logoType, label }: Props) {
	const STYLE_KEY = "header.style";

	const showLogo = useWatch({
		name: `${STYLE_KEY}.${logoType}.show`,
	});

	return (
		<div className="my-2 flex flex-col gap-2">
			<h3 className="text-md font-medium">{label}</h3>
			<div className="mx-2 flex flex-col gap-2">
				<RHFCheckboxField
					name={`${STYLE_KEY}.${logoType}.show`}
					label={i18n.t("Show logo")}
				/>
				{showLogo && (
					<>
						{logoType === "trailingLogo" && (
							<RHFIconInput
								name={`${STYLE_KEY}.${logoType}.url`}
								label={i18n.t("Logo")}
								accept={"image/*"}
							/>
						)}
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
					</>
				)}
			</div>
		</div>
	);
}
