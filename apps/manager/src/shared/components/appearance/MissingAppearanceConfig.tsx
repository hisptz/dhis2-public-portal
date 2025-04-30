import React from "react";
import i18n from "@dhis2/d2-i18n";
import { NoticeBox } from "@dhis2/ui";

export function MissingAppearanceConfig() {
	return (
		<div className="w-full">
			<NoticeBox
				error={true}
				title={i18n.t("Missing Appearance configurations")}
			>
				{
					<div className="flex flex-col gap-2">
						<p>
							{i18n.t(
								"There are no appearance configurations yet. Refresh the browser to import the default configurations.",
							)}
						</p>
					</div>
				}
			</NoticeBox>
		</div>
	);
}
