import React from "react";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	Divider,
	IconDelete16,
	IconLayoutColumns24,
} from "@dhis2/ui";
import { SectionVisualizations } from "./components/SectionVisualizations";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useSectionNamePrefix } from "../../hooks/route";
import {
	DisplayItem,
	DisplayItemType,
	Section,
	SectionType,
	VisualizationItem,
} from "@packages/shared/schemas";
import { EditVisualization } from "../../../VisualizationModule/components/AddVisualization/componets/EditVisualization";
import { AddVisualization } from "../../../VisualizationModule/components/AddVisualization/AddVisualization";
import { RHFRichTextAreaField } from "../../../Fields/RHFRichTextAreaField";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import { startCase } from "lodash";
import { FeedbakForm } from "./components/FeedbackForm";

export function SectionVisualizationsConfig() {
	const { moduleId, sectionIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/",
	});
	const namePrefix = useSectionNamePrefix();
	const navigate = useNavigate();

	const { fields, remove, update, append } = useFieldArray<
		{
			config: {
				sections: Section[];
			};
		},
		`config.sections.${number}.items`
	>({
		name: `${namePrefix}.items`,
		keyName: "fieldId" as unknown as "id",
	});

	const { setValue } = useFormContext();

	const rows = fields.map((field, index) => ({
		...field,
		actions: (
			<ButtonStrip key={field.id}>
				{field.type === DisplayItemType.VISUALIZATION && (
					<EditVisualization
						visualization={field.item}
						onUpdate={(data) =>
							update(index, {
								type: DisplayItemType.VISUALIZATION,
								item: data,
							})
						}
					/>
				)}
				<Button
					onClick={() => remove(index)}
					title={i18n.t("Remove")}
					icon={<IconDelete16 />}
				/>
			</ButtonStrip>
		),
	}));
	const sectionType = useWatch({
		name: `config.sections.${sectionIndex}.type`,
	});

	const onAddVisualization = (visualization: VisualizationItem) => {
		if (sectionType == SectionType.SINGLE_ITEM) {
			const displayItem: DisplayItem = {
				type: DisplayItemType.VISUALIZATION,
				item: {
					...visualization,
				},
			};

			setValue(`config.sections.${sectionIndex}.item`, displayItem);
		} else {
			const displayItem: DisplayItem =
				sectionType === SectionType.GRID_LAYOUT
					? {
							type: DisplayItemType.SINGLE_VALUE,
							item: {
								...visualization,
								icon: "",
							},
						}
					: {
							type: DisplayItemType.VISUALIZATION,
							item: {
								...visualization,
							},
						};

			append(displayItem);
		}
	};

	const singleItemValue = useWatch({
		name: `config.sections.${sectionIndex}.item`,
	});

	const DisplaySingleItemSelector = (item: DisplayItem) => {
		const singleItemVisualization = [singleItemValue]?.map(
			(item, index) => {
				return {
					...item,
					actions: (
						<ButtonStrip key={item?.item?.id}>
							{
								<EditVisualization
									visualization={item.item}
									onUpdate={(data) => {
										setValue(
											`config.sections.${sectionIndex}.item`,
											{
												type: DisplayItemType.VISUALIZATION,
												item: {
													...data,
												},
											},
										);
									}}
								/>
							}
							<Button
								onClick={() => remove(index)}
								title={i18n.t("Remove")}
								icon={<IconDelete16 />}
							/>
						</ButtonStrip>
					),
				};
			},
		);

		switch (item?.type) {
			case DisplayItemType.VISUALIZATION:
			case DisplayItemType.SINGLE_VALUE:
				return (
					<>
						{singleItemVisualization.length != 1 && (
							<ButtonStrip end>
								<AddVisualization onAdd={onAddVisualization} />
							</ButtonStrip>
						)}
						<Divider />

						<SectionVisualizations
							visualizations={singleItemVisualization}
						/>
					</>
				);
			case DisplayItemType.RICH_TEXT:
				return (
					<RHFRichTextAreaField
						required
						name={`${namePrefix}.item.item.content`}
						label={""}
					/>
				);
				case DisplayItemType.FEEDBACK:
					return (
						<FeedbakForm />
					);
			default:
				return <div>Display Type not supported yet</div>;
		}
	};

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">
					{i18n.t(
						sectionType == SectionType.SINGLE_ITEM
							? "Item"
							: "Items",
					)}
				</h3>
				<ButtonStrip end>
					{![
						SectionType.GRID_LAYOUT,
						SectionType.SINGLE_ITEM,
					].includes(sectionType) && (
						<Button
							onClick={() =>
								navigate({
									to: "/modules/$moduleId/edit/section/$sectionIndex/layout",
									params: { moduleId, sectionIndex },
								})
							}
							icon={<IconLayoutColumns24 />}
						>
							{i18n.t("Configure layout")}
						</Button>
					)}
					{sectionType != SectionType.SINGLE_ITEM && (
						<AddVisualization onAdd={onAddVisualization} />
					)}
				</ButtonStrip>
			</div>
			<Divider />
			{sectionType === SectionType.SINGLE_ITEM ? (
				<>
					<RHFSingleSelectField
						required
						label={i18n.t("Item Type")}
						placeholder={i18n.t("Select Item type")}
						options={Object.values(DisplayItemType).map((type) => {
							return {
								label: i18n.t(startCase(type.toLowerCase())),
								value: type,
							};
						})}
						name={`${namePrefix}.item.type`}
					/>
					{DisplaySingleItemSelector(singleItemValue)}
				</>
			) : (
				<SectionVisualizations visualizations={rows} />
			)}
		</div>
	);
}
