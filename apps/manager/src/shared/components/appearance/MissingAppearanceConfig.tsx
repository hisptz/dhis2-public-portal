import React from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, NoticeBox } from "@dhis2/ui";

type Props = {
	onAddConfigurations?: () => void;
};

export function MissingAppearanceConfig({ onAddConfigurations }: Props) {
	return (
		<div className="w-full">
			<NoticeBox title={i18n.t("Missing Appearance configurations")}>
				{
					<div className="flex flex-col gap-2">
						<p>
							{i18n.t(
								"There are no appearance configurations yet. Click the below button to create one.",
							)}
						</p>

						<div className="flex mt-4">
							<Button onClick={onAddConfigurations} small primary>
								Create
							</Button>
						</div>
					</div>
				}
			</NoticeBox>
		</div>
	);
}
