import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	Divider,
	IconDelete16,
	SingleSelectField,
	SingleSelectOption,
} from "@dhis2/ui";

import { useController } from "react-hook-form";

import {
	DisplayItem,
	DisplayItemType,
	SectionModuleConfig,
	VisualizationDisplayItemType,
	VisualizationItem,
} from "@packages/shared/schemas";

import { RichTextEditor } from "@hisptz/dhis2-ui";
import { isEmpty, startCase } from "lodash";
import { useSectionNamePrefix } from "../../../hooks/route";
import { EditVisualization } from "../../../../VisualizationModule/components/AddVisualization/componets/EditVisualization";
import { AddVisualization } from "../../../../VisualizationModule/components/AddVisualization/AddVisualization";
import { SectionVisualizations } from "./SectionVisualizations";
import { FeedbackItemConfig } from "../../Feedback/FeedbackConfig";

export function SectionSingleItemConfig() {
	const namePrefix = useSectionNamePrefix();

	const { field, fieldState } = useController<
		SectionModuleConfig,
		`config.sections.${number}.item`
	>({
		name: `${namePrefix}.item`,
	});

	const [selectedSingleItemType, setSelectedSingleItemType] =
		useState<string>(field.value.type);

	const onAddVisualization = (visualization: VisualizationItem) => {
		const displayItem: DisplayItem =
			selectedSingleItemType === DisplayItemType.SINGLE_VALUE
				? {
						type: DisplayItemType.SINGLE_VALUE,
						item: {
							...visualization,
							icon: visualization.icon ?? "",
						},
					}
				: {
						type: DisplayItemType.VISUALIZATION,
						item: {
							...visualization,
						},
					};
		field.onChange(displayItem);
	};

	const DisplaySingleItemSelector = () => {
		const singleItemVisualization =
			field.value.type == DisplayItemType.RICH_TEXT||field.value.type == DisplayItemType.FEEDBACK
				? []
				: ([field.value]?.map((item, index) => {
						return {
							...item,
							actions: (
								<ButtonStrip key={item?.item?.id}>
									{
										<EditVisualization
											visualization={
												item.type ==
												DisplayItemType.SINGLE_VALUE
													? {
															type: VisualizationDisplayItemType.CHART,
															id: item.item.id,
														}
													: item.item
											}
											onUpdate={(data) => {
												field.onChange({
													type: selectedSingleItemType,
													item: {
														...data,
													},
												});
											}}
										/>
									}
									<Button
										onClick={() => {}}
										title={i18n.t("Remove")}
										icon={<IconDelete16 />}
									/>
								</ButtonStrip>
							),
						};
					}) ?? []);

		switch (selectedSingleItemType) {
			case DisplayItemType.VISUALIZATION:
			case DisplayItemType.SINGLE_VALUE:
				return (
					<>
						{![
							DisplayItemType.VISUALIZATION,
							DisplayItemType.SINGLE_VALUE,
						].includes(field.value.type) && (
							<ButtonStrip end>
								<AddVisualization onAdd={onAddVisualization} />
							</ButtonStrip>
						)}
						<Divider />
						{!isEmpty(field.value) && (
							<SectionVisualizations
								visualizations={singleItemVisualization}
							/>
						)}
					</>
				);
			case DisplayItemType.RICH_TEXT:
				return (
					<RichTextEditor
						label={""}
						validationText={fieldState?.error?.message}
						error={!!fieldState.error}
						value={
							field.value.type == DisplayItemType.RICH_TEXT
								? field.value.item.content
								: ""
						}
						onChange={(value) =>
							field.onChange({
								item: { id: "rich-text", content: value },
								type: DisplayItemType.RICH_TEXT,
							})
						}
						name={""}
					/>
				);
				case DisplayItemType.FEEDBACK:
					return (
						<FeedbackItemConfig />
					);
			default:
				return <></>;
		}
	};

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">{i18n.t("Item")}</h3>
			</div>
			<Divider />

			<>
				<SingleSelectField
					{...field}
					required
					validationText={fieldState?.error?.message}
					error={!!fieldState.error}
					selected={selectedSingleItemType}
					label={i18n.t("Item Type")}
					onChange={(val) => {
						setSelectedSingleItemType(val.selected);
					}}
				>
					{Object.values(DisplayItemType).map((type) => {
						return (
							<SingleSelectOption
								label={i18n.t(startCase(type.toLowerCase()))}
								value={type}
							/>
						);
					})}
				</SingleSelectField>
				{DisplaySingleItemSelector()}
			</>
		</div>
	);
}
