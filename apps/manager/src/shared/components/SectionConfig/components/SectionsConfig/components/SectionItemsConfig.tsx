import React from "react";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	Divider,
	IconDelete16,
	IconLayoutColumns24,
} from "@dhis2/ui";

import { useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "@tanstack/react-router";

import {
	DisplayItem,
	DisplayItemType,
	Section,
	SectionType,
	VisualizationItem,
} from "@packages/shared/schemas";

import { useSectionNamePrefix } from "../../../hooks/route";
import { EditVisualization } from "../../../../VisualizationModule/components/AddVisualization/componets/EditVisualization";
import { SectionVisualizations } from "./SectionVisualizations";
import { AddVisualization } from "../../../../VisualizationModule/components/AddVisualization/AddVisualization";

export function SectionItemsConfig() {
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
	const sectionType = useWatch({
		name: `config.sections.${sectionIndex}.type`,
	});

	const onAddVisualization = (visualization: VisualizationItem) => {
		const displayItem: DisplayItem =
			sectionType === SectionType.GRID_LAYOUT
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
		append(displayItem);
	};

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">{i18n.t("Items")}</h3>
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

			<SectionVisualizations visualizations={rows} />
		</div>
	);
}
