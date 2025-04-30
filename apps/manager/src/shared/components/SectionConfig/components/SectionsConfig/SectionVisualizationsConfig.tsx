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
import { useFieldArray, useWatch } from "react-hook-form";
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

	const onAddVisualization = (visualization: VisualizationItem) => {
		const displayItem: DisplayItem = {
			type: DisplayItemType.VISUALIZATION,
			item: visualization,
		};
		append(displayItem);
	};

	const sectionType = useWatch({
		name: `config.sections.${sectionIndex}.type`,
	});

	const singleItemValue = useWatch({
		name: `config.sections.${sectionIndex}.item`,
	});

	const DisplaySingleItemSelector = (item: DisplayItem) => {
		switch (item.type) {
			case DisplayItemType.VISUALIZATION:
			case DisplayItemType.SINGLE_VALUE:
				return (
					<>
						{rows.length != 1 && (
							<ButtonStrip end>
								<AddVisualization onAdd={onAddVisualization} />
							</ButtonStrip>
						)}
						<Divider />
						<SectionVisualizations visualizations={rows} />
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
			default:
				return <div>Display Type not supported yet</div>;
		}
	};

	console.log(singleItemValue);

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
