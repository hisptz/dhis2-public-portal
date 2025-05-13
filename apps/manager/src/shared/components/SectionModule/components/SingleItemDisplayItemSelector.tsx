import { DisplayItemType, SectionModuleConfig } from "@packages/shared/schemas";
import React from "react";
import { useWatch } from "react-hook-form";
import i18n from "@dhis2/d2-i18n";
import { RHFRichTextAreaField } from "../../Fields/RHFRichTextAreaField";
import { FeedbackItemConfig } from "../../SectionConfig/components/Feedback/FeedbackConfig";
import { SingleItemVisualizationForm } from "../../SectionConfig/components/SectionsConfig/components/SingleItemVisualizationForm";

export function SingleItemDisplayItemSelector({
	namePrefix,
}: {
	namePrefix: `config.sections.${number}.item`;
}) {
	const selectedSingleItemType = useWatch<
		SectionModuleConfig,
		`config.sections.${number}.item.type`
	>({
		name: `${namePrefix}.type`,
	});

	switch (selectedSingleItemType) {
		case DisplayItemType.VISUALIZATION:
		case DisplayItemType.SINGLE_VALUE:
			return <SingleItemVisualizationForm namePrefix={namePrefix} />;
		case DisplayItemType.RICH_TEXT:
			return (
				<RHFRichTextAreaField
					label={i18n.t("Content")}
					name={`${namePrefix}.item.content`}
				/>
			);
		case DisplayItemType.FEEDBACK:
			return <FeedbackItemConfig namePrefix={namePrefix} />;
		default:
			return <></>;
	}
}
