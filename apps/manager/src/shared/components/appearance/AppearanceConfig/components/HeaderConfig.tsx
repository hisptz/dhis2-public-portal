import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { ConfigurationTitle } from "./ConfigurationTitle";
import { ConfigurationDetails } from "./ConfigurationDetails";
import { ConfigurationColor } from "./ConfigurationColor";
import { Button, IconEdit16 } from "@dhis2/ui";
import { HeaderConfigForm } from "../../appearance-config-forms/HeaderConfigForm";

type Props = {
	appearanceConfig: AppAppearanceConfig;
	refetchConfig: () => void;
};

export function HeaderConfig({ appearanceConfig, refetchConfig }: Props) {
	const [showHeaderConfig, setShowHeaderConfig] = useState(false);

	const { header, title } = appearanceConfig;
	const { style } = header;

	return (
		<>
			<section>
				<ConfigurationTitle title={i18n.t("Header configuration")} />
				<div className="mx-2 flex flex-col gap-2">
					{title?.main && (
						<ConfigurationDetails
							title={i18n.t("Title")}
							value={title?.main}
						/>
					)}

					{title?.subtitle && (
						<ConfigurationDetails
							title={i18n.t("Subtitle")}
							value={title?.subtitle}
						/>
					)}

					{style?.headerBackgroundColor &&
						style?.coloredBackground && (
							<ConfigurationDetails
								title={i18n.t("Background color")}
							>
								<ConfigurationColor
									colorCode={style?.headerBackgroundColor}
								/>
							</ConfigurationDetails>
						)}

					{style?.containerHeight && (
						<ConfigurationDetails
							title={i18n.t("Header height")}
							value={`${style?.containerHeight}px`}
						/>
					)}

					{style?.leadingLogo && (
						<ConfigurationDetails title={i18n.t("Leading logo")}>
							<img
								src={style?.leadingLogo.url}
								alt={i18n.t("Trailing logo")}
								className="w-16 h-16 object-cover rounded-sm shadow-md border-gray-500"
							/>
						</ConfigurationDetails>
					)}
					{style?.trailingLogo && (
						<ConfigurationDetails title={i18n.t("Trailing logo")}>
							<img
								src={style?.trailingLogo.url}
								alt={i18n.t("Trailing logo")}
								className="w-16 h-16 object-cover rounded-sm shadow-md border-gray-500"
							/>
						</ConfigurationDetails>
					)}
				</div>

				<div className="mt-2">
					<Button
						onClick={() => setShowHeaderConfig(true)}
						small
						secondary
						icon={<IconEdit16 />}
					>
						{i18n.t("Update")}
					</Button>
				</div>
			</section>
			{showHeaderConfig && (
				<HeaderConfigForm
					configurations={appearanceConfig}
					onClose={() => setShowHeaderConfig(false)}
					onComplete={() => refetchConfig()}
				/>
			)}
		</>
	);
}
