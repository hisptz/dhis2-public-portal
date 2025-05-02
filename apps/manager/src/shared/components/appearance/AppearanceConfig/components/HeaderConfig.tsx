import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { ConfigurationTitle } from "./ConfigurationTitle";
import { ConfigurationDetails } from "./ConfigurationDetails";
import { ConfigurationColor } from "./ConfigurationColor";
import { Button, IconEdit16 } from "@dhis2/ui";
import { HeaderConfigForm } from "../../appearance-config-forms/HeaderConfigForm";
import { useConfig } from "@dhis2/app-runtime";

type Props = {
	appearanceConfig: AppAppearanceConfig;
	refetchConfig: () => void;
};

export function HeaderConfig({ appearanceConfig, refetchConfig }: Props) {
	const config = useConfig();
	const [showHeaderConfig, setShowHeaderConfig] = useState(false);

	const { header } = appearanceConfig;
	const title = header.title.text;
	const subtitle = header.subtitle.text;
	const { style } = header;

	return (
		<>
			<section>
				<ConfigurationTitle title={i18n.t("Header configuration")} />
				<div className="mx-2 flex flex-col gap-2">
					{title && (
						<ConfigurationDetails
							title={i18n.t("Title")}
							value={title}
						/>
					)}

					{subtitle && (
						<ConfigurationDetails
							title={i18n.t("Subtitle")}
							value={subtitle}
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

					{style?.trailingLogo?.show && (
						<ConfigurationDetails title={i18n.t("Trailing logo")}>
							<img
								height={50}
								width={50}
								alt={"icon"}
								src={`${config.baseUrl}/api/documents/${style?.trailingLogo.url}/data`}
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
