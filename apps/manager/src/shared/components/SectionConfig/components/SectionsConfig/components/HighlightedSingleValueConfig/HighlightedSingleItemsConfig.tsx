import React from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, ButtonStrip, Divider, IconDelete16 } from "@dhis2/ui";

import { useFieldArray } from "react-hook-form";

import {
	DisplayItemType,
	GridLayoutSectionConfig,
	HighlightedSingleValueConfig,
	HighlightedSingleValueDisplayItemConfig,
} from "@packages/shared/schemas";

import { useSectionNamePrefix } from "../../../../hooks/route";
import { EditHighlightedItem } from "./components/AddVisualization/componets/EditHighlightedItem";
import { AddHighlightedItem } from "./components/AddVisualization/AddHighlightedItem";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import { useConfig } from "@dhis2/app-runtime";
import { VisualizationNameResolver } from "../../../../../VisualizationNameResolver";

const columns: SimpleTableColumn[] = [
	{
		label: i18n.t("Name"),
		key: "name",
	},
	{
		label: i18n.t("icon"),
		key: "icon",
	},
	{
		label: i18n.t("Actions"),
		key: "actions",
	},
];

export function HighlightedSingleItemsConfig() {
	const { baseUrl } = useConfig();
	const namePrefix = useSectionNamePrefix();

	const { fields, remove, update, append } = useFieldArray<
		{
			config: {
				sections: GridLayoutSectionConfig[];
			};
		},
		`config.sections.${number}.items`
	>({
		name: `${namePrefix}.items`,
		keyName: "fieldId" as unknown as "id",
	});

	const rows = fields.map(
		(field: HighlightedSingleValueDisplayItemConfig, index) => ({
			...field,
			id: field.item.id,
			name: <VisualizationNameResolver id={field.item.id} />,
			icon: (
				<img
					alt={"icon"}
					height={32}
					width={32}
					src={`${baseUrl}/api/documents/${field.item.icon}/data`}
				/>
			),
			actions: (
				<ButtonStrip key={field.item.id}>
					<EditHighlightedItem
						visualization={
							field.item as HighlightedSingleValueConfig
						}
						onUpdate={(data) =>
							update(index, {
								type: DisplayItemType.HIGHLIGHTED_SINGLE_VALUE,
								item: data,
							})
						}
					/>
					<Button
						onClick={() => remove(index)}
						title={i18n.t("Remove")}
						icon={<IconDelete16 />}
					/>
				</ButtonStrip>
			),
		}),
	);

	const onAddVisualization = (
		visualization: HighlightedSingleValueConfig,
	) => {
		append({
			type: DisplayItemType.HIGHLIGHTED_SINGLE_VALUE,
			item: visualization,
		});
	};

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">{i18n.t("Items")}</h3>
				<ButtonStrip end>
					<AddHighlightedItem onAdd={onAddVisualization} />
				</ButtonStrip>
			</div>
			<Divider />
			<SimpleTable rows={rows} columns={columns} />
		</div>
	);
}
