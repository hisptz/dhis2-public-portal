import { DisplayItemType, SectionModuleConfig } from "@packages/shared/schemas";
import React from "react";
import { useWatch } from "react-hook-form";
import i18n from "@dhis2/d2-i18n";
import { RHFRichTextAreaField } from "../../Fields/RHFRichTextAreaField";
import { FeedbackItemConfig } from "../../SectionConfig/components/Feedback/FeedbackConfig";

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

	// const singleItemVisualization =
	// 	selectedSingleItemType == DisplayItemType.RICH_TEXT ||
	// 	selectedSingleItemType == DisplayItemType.FEEDBACK
	// 		? []
	// 		: ([field.value]?.map((item, index) => {
	// 				return {
	// 					...item,
	// 					actions: (
	// 						<ButtonStrip key={item?.item?.id}>
	// 							{
	// 								<EditVisualization
	// 									visualization={
	// 										item.type ==
	// 										DisplayItemType.SINGLE_VALUE
	// 											? {
	// 													type: VisualizationDisplayItemType.CHART,
	// 													id: item.item.id,
	// 													icon: item.item.icon,
	// 												}
	// 											: item.item
	// 									}
	// 									onUpdate={(data) => {
	// 										field.onChange({
	// 											type: selectedSingleItemType,
	// 											item:
	// 												item.type ==
	// 												DisplayItemType.SINGLE_VALUE
	// 													? {
	// 															...data,
	// 															icon:
	// 																data.icon ??
	// 																"",
	// 														}
	// 													: {
	// 															...data,
	// 														},
	// 										});
	// 									}}
	// 								/>
	// 							}
	// 						</ButtonStrip>
	// 					),
	// 				};
	// 			}) ?? []);

	switch (selectedSingleItemType) {
		case DisplayItemType.VISUALIZATION:
		case DisplayItemType.SINGLE_VALUE:
			return (
				<>
					{/*{![*/}
					{/*	DisplayItemType.VISUALIZATION,*/}
					{/*	DisplayItemType.SINGLE_VALUE,*/}
					{/*].includes(selectedSingleItemType) && (*/}
					{/*	<ButtonStrip end>*/}
					{/*		<AddVisualization onAdd={onAddVisualization} />*/}
					{/*	</ButtonStrip>*/}
					{/*)}*/}
					{/*<Divider />*/}
					{/*{!isEmpty(field.value) && (*/}
					{/*	<SectionVisualizations*/}
					{/*		visualizations={singleItemVisualization}*/}
					{/*	/>*/}
					{/*)}*/}
				</>
			);
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
