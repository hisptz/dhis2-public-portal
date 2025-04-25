import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { map } from "lodash";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { ConfigurationTitle } from "./components/ConfigurationTitle";
import { ConfigurationDetails } from "./components/ConfigurationDetails";
import { ConfigurationColor } from "./components/ConfigurationColor";
import { getTitleCaseFromCamelCase } from "@packages/shared/utils";
import { Button, IconEdit16 } from "@dhis2/ui";
import { AppColorConfigForm } from "../appearance-config-forms/AppColorConfigForm";
import { HeaderConfigForm } from "../appearance-config-forms/HeaderConfigForm";
import { FooterConfigForm } from "../appearance-config-forms/FooterConfigForm";

type Props = {
	appearanceConfig: AppAppearanceConfig;
	refetchConfig: () => void;
};

function getObjectKeyValueArray(
	object: Record<string, unknown>,
): Array<{ [key: string]: string }> {
	return map(object, (value, key) => ({
		[getTitleCaseFromCamelCase(key)]: `${value}`,
	}));
}

export function AppearanceConfig({ appearanceConfig, refetchConfig }: Props) {
	const [showAppColor, setShowAppColor] = useState(false);
	const [showHeaderConfig, setShowHeaderConfig] = useState(false);
	const [showFooterConfig, setShowFooterConfig] = useState(false);

	const { colors, header, footer, title } = appearanceConfig;
	const { primary, chartColors, background } = colors;
	const { title: titleConfigurations, logo, hasMenu, trailingLogo } = header;
	const { copyright, footerLinks, address } = footer;

	return (
		<div className="flex flex-col gap-6">
			{/*Application colors configurations*/}
			<section>
				<ConfigurationTitle title={i18n.t("Application colors")} />
				<div className="flex flex-col gap-2">
					<ConfigurationDetails title={"Primary color"}>
						<ConfigurationColor colorCode={primary} />
					</ConfigurationDetails>
					<ConfigurationDetails title={"Background color"}>
						<ConfigurationColor colorCode={background} />
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
					configurations={appearanceConfig}
					onClose={() => setShowAppColor(false)}
					onComplete={() => refetchConfig()}
				/>
			)}

			{/*Header configurations*/}
			<section>
				<ConfigurationTitle title={i18n.t("Header configuration")} />
				<div className="flex flex-col gap-2">
					<ConfigurationDetails
						title={i18n.t("Title enabled")}
						value={logo.enabled ? "Yes" : "No"}
					/>
					<ConfigurationDetails
						title={i18n.t("Title label")}
						value={title.main}
					/>
					{title.subtitle && (
						<ConfigurationDetails
							title={i18n.t("Subtitle label")}
							value={title.subtitle}
						/>
					)}
					{titleConfigurations?.style && (
						<ConfigurationDetails title={i18n.t("Title style")}>
							<div className="ml-2 flex flex-col gap-1">
								{getObjectKeyValueArray(
									titleConfigurations.style,
								).map((item, index) => {
									const [key, value] =
										Object.entries(item)[0];
									return (
										<ConfigurationDetails
											key={`${index}-${key}`}
											title={key}
											value={value}
										/>
									);
								})}
							</div>
						</ConfigurationDetails>
					)}
					{hasMenu && (
						<ConfigurationDetails
							title={i18n.t("Has menu")}
							value={hasMenu ? "Yes" : "No"}
						/>
					)}
					{trailingLogo && (
						<ConfigurationDetails title={i18n.t("Trailing logo")}>
							<img
								src={trailingLogo}
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

			{/*Footer configurations*/}
			<section>
				<ConfigurationTitle title={i18n.t("Footer configuration")} />
				<div className="flex flex-col gap-2">
					{copyright && (
						<ConfigurationDetails
							title={i18n.t("Copyright")}
							value={copyright}
						/>
					)}
					{footerLinks && (
						<ConfigurationDetails title={i18n.t("Footer links")}>
							<div className="ml-2 flex flex-col gap-1">
								<ConfigurationDetails
									title={i18n.t("Label")}
									value={footerLinks.title}
								/>
								<ConfigurationDetails title={i18n.t("Links")}>
									<div className="ml-2 flex flex-col gap-1">
										<ul className="list-disc list-inside">
											{(footerLinks.links ?? []).map(
												(link, index) => (
													<li
														key={`${index}-${link.url}`}
													>
														<a
															key={`link-${index}-${link.url}`}
															href={link.url}
															target="_blank"
															className="text-primary-500 hover:underline"
														>
															{link.name}
														</a>
													</li>
												),
											)}
										</ul>
									</div>
								</ConfigurationDetails>
							</div>
						</ConfigurationDetails>
					)}

					{address && (
						<ConfigurationDetails
							title={i18n.t("Address")}
							value={address.content}
						/>
					)}
				</div>

				<div className="mt-2">
					<Button
						onClick={() => setShowFooterConfig(true)}
						small
						secondary
						icon={<IconEdit16 />}
					>
						{i18n.t("Update")}
					</Button>
				</div>
			</section>
			{showFooterConfig && (
				<FooterConfigForm
					configurations={appearanceConfig}
					onClose={() => setShowFooterConfig(false)}
					onComplete={() => refetchConfig()}
				/>
			)}
		</div>
	);
}
