import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { ConfigurationTitle } from "./ConfigurationTitle";
import { ConfigurationDetails } from "./ConfigurationDetails";
import { RichTextView } from "@packages/ui/visualizations";
import { Button, IconEdit16 } from "@dhis2/ui";
import { FooterConfigForm } from "../../appearance-config-forms/FooterConfigForm";

type Props = {
	config: AppAppearanceConfig;
	refetchConfig: () => void;
};

export function FooterConfig({ config, refetchConfig }: Props) {
	const [showFooterConfig, setShowFooterConfig] = useState(false);

	const { footer } = config;
	const { copyright, footerLinks, address } = footer;

	return (
		<>
			<section>
				<ConfigurationTitle title={i18n.t("Footer configuration")} />
				<div className="mx-2 flex flex-col gap-2">
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
															rel="noreferrer"
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
						<ConfigurationDetails title={i18n.t("Address")}>
							<RichTextView content={address.content} />
						</ConfigurationDetails>
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
					configurations={config}
					onClose={() => setShowFooterConfig(false)}
					onComplete={() => refetchConfig()}
				/>
			)}
		</>
	);
}
