import React from "react";
import i18n from "@dhis2/d2-i18n";
import { Divider } from "@dhis2/ui";

import { DisplayItemType } from "@packages/shared/schemas";

import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import { startCase } from "lodash";
import { useSectionNamePrefix } from "../../../hooks/route";
import { SingleItemDisplayItemSelector } from "../../../../SectionModule/components/SingleItemDisplayItemSelector";

export function SectionSingleItemConfig() {
	const namePrefix = useSectionNamePrefix();

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">{i18n.t("Item")}</h3>
			</div>
			<Divider />
			<>
				<RHFSingleSelectField
					options={Object.values(DisplayItemType).map((type) => {
						return {
							label: i18n.t(startCase(type.toLowerCase())),
							value: type,
						};
					})}
					required
					label={i18n.t("Item Type")}
					name={`${namePrefix}.item.type`}
				/>
				<SingleItemDisplayItemSelector
					namePrefix={`${namePrefix}.item`}
				/>
			</>
		</div>
	);
}
