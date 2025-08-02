import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { ConfigurationTitle } from "./ConfigurationTitle";
import { ConfigurationDetails } from "./ConfigurationDetails";
import { ConfigurationColor } from "./ConfigurationColor";
import { Button, IconEdit16 } from "@dhis2/ui";
import { AppColorConfigForm } from "../../appearance-config-forms/AppColorConfigForm";

type Props = {
	config: AppAppearanceConfig;
	refetchConfig: () => void;
};

export function AppColorConfig({ config, refetchConfig }: Props) {
	const [showAppColor, setShowAppColor] = useState(false);

	const { colors } = config;
	const { primary, chartColors, background, titlesColor } = colors;

	return (
		<>
			<section>
				<ConfigurationTitle title={i18n.t("Application colors")} />
				<div className="mx-2 flex flex-col gap-2">
					<ConfigurationDetails title={"Primary color"}>
						<ConfigurationColor colorCode={primary} />
					</ConfigurationDetails>
					<ConfigurationDetails title={"Background color"}>
						<ConfigurationColor colorCode={background} />
					</ConfigurationDetails>
					<ConfigurationDetails title={"Titles color"}>
						<ConfigurationColor colorCode={titlesColor} />
					</ConfigurationDetails>
					{chartColors && (
						<ConfigurationDetails title={"Chart colors"}>
							<div className="flex flex-row gap-2">
								{chartColors.map((color, index) => (
									<ConfigurationColor
										key={`${index}-${color}`}
										colorCode={color}
									/>
								))}
							</div>
						</ConfigurationDetails>
					)}
				</div>
				<div className="mt-2">
					<Button
						onClick={() => setShowAppColor(true)}
						small
						secondary
						icon={<IconEdit16 />}
					>
						{i18n.t("Update")}
					</Button>
				</div>
			</section>

			{showAppColor && (
				<AppColorConfigForm
					configurations={config}
					onClose={() => setShowAppColor(false)}
					onComplete={() => refetchConfig()}
				/>
			)}
		</>
	);
}
