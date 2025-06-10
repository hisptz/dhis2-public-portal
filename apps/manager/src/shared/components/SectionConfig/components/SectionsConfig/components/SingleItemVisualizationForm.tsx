import React, { useEffect } from "react";
import { Box } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import {
	DisplayItemType,
	SectionModuleConfig,
	VisualizationDisplayItemType,
} from "@packages/shared/schemas";
import { RHFTextAreaField } from "../../../../Fields/RHFTextAreaField";
import { SingleItemVisualizationSelector } from "./SingleItemVisualizationSelector";
import { useFormContext, useWatch } from "react-hook-form";

export function SingleItemVisualizationForm({
	namePrefix,
}: {
	namePrefix: `config.sections.${number}.item`;
}) {
	const visType = useWatch<SectionModuleConfig>({
		name: `${namePrefix}.type`,
	});

	const { setValue } = useFormContext();

	useEffect(() => {
		if (visType === DisplayItemType.HIGHLIGHTED_SINGLE_VALUE) {
			setValue(
				`${namePrefix}.item.type`,
				VisualizationDisplayItemType.CHART,
			);
		}
	}, [visType]);

	return (
		<Box>
			<form className="flex flex-col gap-4">
				{visType !== DisplayItemType.HIGHLIGHTED_SINGLE_VALUE && (
					<RHFSingleSelectField
						required
						label={i18n.t("Type")}
						options={[
							{
								label: i18n.t("Visualization"),
								value: VisualizationDisplayItemType.CHART,
							},
							...(visType !==
							DisplayItemType.HIGHLIGHTED_SINGLE_VALUE
								? [
										{
											label: i18n.t("Map"),
											value: VisualizationDisplayItemType.MAP,
										},
									]
								: []),
						]}
						name={`${namePrefix}.item.type`}
					/>
				)}
				<SingleItemVisualizationSelector namePrefix={namePrefix} />
				<RHFTextAreaField
					name={`${namePrefix}.item.caption`}
					label={i18n.t("Caption")}
				/>
			</form>
		</Box>
	);
}
